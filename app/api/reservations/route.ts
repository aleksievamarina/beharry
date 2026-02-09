import { NextResponse } from "next/server"
import { getReservations, addReservation, getReservedSeatsForSlot } from "@/lib/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const time = searchParams.get("time")

  if (date && time) {
    const reserved = getReservedSeatsForSlot(date, time)
    return NextResponse.json({ reservedSeats: reserved })
  }

  const reservations = getReservations()
  return NextResponse.json({ reservations })
}

export async function POST(request: Request) {
  const body = await request.json()
  const reservation = addReservation(body)
  return NextResponse.json({ reservation }, { status: 201 })
}
