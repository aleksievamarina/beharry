import { NextResponse } from "next/server"
import { updateVoucherStatus } from "@/lib/store"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const voucher = updateVoucherStatus(id, body.status)

  if (!voucher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ voucher })
}
