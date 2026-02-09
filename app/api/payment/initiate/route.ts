import { NextResponse } from "next/server"
import { createPaymentRequest, generateOrderId, isBoricaConfigured, diagnoseBoricaSetup } from "@/lib/borica"
import { addVoucher } from "@/lib/store"

// Store pending payments in memory (in production, use a database)
const pendingPayments = new Map<
  string,
  {
    type: "voucher" | "reservation"
    data: Record<string, string | number | number[]>
    createdAt: number
  }
>()

export function getPendingPayment(orderId: string) {
  return pendingPayments.get(orderId)
}

export function removePendingPayment(orderId: string) {
  pendingPayments.delete(orderId)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentType, amountBGN, description, voucherData, reservationData } = body

    if (!amountBGN || amountBGN < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const diagnosis = diagnoseBoricaSetup()
    console.log("[v0] Payment initiate - type:", paymentType, "amount:", amountBGN)
    console.log("[v0] BORICA diagnosis:", JSON.stringify(diagnosis))

    // Check if BORICA is configured
    if (!isBoricaConfigured()) {
      // Fallback: simulate payment for development/testing without BORICA keys
      const orderId = generateOrderId()

      if (paymentType === "voucher" && voucherData) {
        addVoucher({
          code: voucherData.code,
          type: voucherData.type,
          amount: voucherData.amount,
          recipientName: voucherData.recipientName || "",
          senderName: voucherData.senderName || "",
          message: voucherData.message || "",
          buyerEmail: voucherData.buyerEmail || "",
          buyerPhone: voucherData.buyerPhone || "",
        })
      }

      return NextResponse.json({
        mode: "simulation",
        success: true,
        orderId,
        message: "Payment simulated (BORICA not configured). Voucher saved.",
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
    const orderId = generateOrderId()
    const backref = `${baseUrl}/api/payment/callback`

    // Store pending payment data
    pendingPayments.set(orderId, {
      type: paymentType,
      data: paymentType === "voucher" ? voucherData : reservationData,
      createdAt: Date.now(),
    })

    // Clean up old pending payments (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000
    for (const [key, value] of pendingPayments.entries()) {
      if (value.createdAt < oneHourAgo) {
        pendingPayments.delete(key)
      }
    }

    console.log("[v0] Creating BORICA payment - orderId:", orderId, "backref:", backref)

    const paymentData = createPaymentRequest({
      orderId,
      amountBGN,
      description: description || "BeHarry Payment",
      backref,
      email: voucherData?.buyerEmail || reservationData?.customerEmail || "",
    })

    return NextResponse.json({
      mode: "borica",
      gatewayUrl: paymentData.gatewayUrl,
      fields: paymentData.fields,
      orderId,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Payment initiation error:", errMsg)
    console.error("[v0] Full error:", error)
    return NextResponse.json(
      { error: `Payment initiation failed: ${errMsg}` },
      { status: 500 }
    )
  }
}
