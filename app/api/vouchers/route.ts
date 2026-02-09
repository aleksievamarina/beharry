import { NextResponse } from "next/server"
import { getVouchers, addVoucher } from "@/lib/store"

export async function GET() {
  const vouchers = getVouchers()
  return NextResponse.json({ vouchers })
}

export async function POST(request: Request) {
  const body = await request.json()
  const voucher = addVoucher(body)
  return NextResponse.json({ voucher }, { status: 201 })
}
