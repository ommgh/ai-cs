import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/store"

export async function GET() {
  return NextResponse.json({ settings: db.getSettings() })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  db.setSettings(body)
  return NextResponse.json({ settings: db.getSettings() })
}
