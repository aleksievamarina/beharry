import { NextResponse } from "next/server"
import { diagnoseBoricaSetup } from "@/lib/borica"

export async function GET() {
  const diagnosis = diagnoseBoricaSetup()
  return NextResponse.json(diagnosis)
}
