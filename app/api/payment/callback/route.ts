import { NextResponse } from "next/server"
import { parsePaymentResponse } from "@/lib/borica"
import { addVoucher, addReservation } from "@/lib/store"
import { getPendingPayment, removePendingPayment } from "@/app/api/payment/initiate/route"

// BORICA POSTs back to this URL after payment
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const responseFields: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      responseFields[key] = value.toString()
    }

    const result = parsePaymentResponse(responseFields)
    const pending = getPendingPayment(result.orderId)

    if (result.isSuccessful && pending) {
      // Payment was successful - process the order
      if (pending.type === "voucher") {
        const d = pending.data as Record<string, string>
        addVoucher({
          code: d.code || "",
          type: (d.type as "voucher" | "giftbox") || "voucher",
          amount: Number(d.amount) || 0,
          recipientName: d.recipientName || "",
          senderName: d.senderName || "",
          message: d.message || "",
          buyerEmail: d.buyerEmail || "",
          buyerPhone: d.buyerPhone || "",
        })
      } else if (pending.type === "reservation") {
        const d = pending.data
        addReservation({
          type: (d.type as "seats" | "event") || "seats",
          date: String(d.date || ""),
          time: String(d.time || ""),
          seats: (d.seats as number[]) || [],
          customerName: String(d.customerName || ""),
          customerEmail: String(d.customerEmail || ""),
          customerPhone: String(d.customerPhone || ""),
          notes: String(d.notes || ""),
        })
      }

      removePendingPayment(result.orderId)

      // Redirect to success page
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
      return NextResponse.redirect(
        `${baseUrl}/payment/success?order=${result.orderId}&type=${pending.type}`,
        { status: 303 }
      )
    }

    // Payment failed
    if (pending) removePendingPayment(result.orderId)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
    return NextResponse.redirect(
      `${baseUrl}/payment/failed?order=${result.orderId}&code=${result.actionCode}&msg=${encodeURIComponent(result.statusMessage)}`,
      { status: 303 }
    )
  } catch (error) {
    console.error("[v0] Payment callback error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/payment/failed?error=processing`, { status: 303 })
  }
}

// Also handle GET (some payment gateways redirect via GET)
export async function GET(request: Request) {
  const url = new URL(request.url)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"

  const order = url.searchParams.get("ORDER") || ""
  const actionCode = url.searchParams.get("ACTION") || url.searchParams.get("ACTION_CODE") || ""

  if (actionCode === "0") {
    return NextResponse.redirect(`${baseUrl}/payment/success?order=${order}`, { status: 303 })
  }

  return NextResponse.redirect(
    `${baseUrl}/payment/failed?order=${order}&code=${actionCode}`,
    { status: 303 }
  )
}
