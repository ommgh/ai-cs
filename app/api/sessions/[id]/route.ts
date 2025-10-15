import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/store"

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const sessionId = ctx.params.id
  const session = db.getSession(sessionId) ?? db.ensureSession(sessionId)
  const messages = db.getMessagesBySession(session.id)
  return NextResponse.json({ sessionId: session.id, messages })
}
