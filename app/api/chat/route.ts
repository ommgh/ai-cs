import { type NextRequest, NextResponse } from "next/server"
import { db, answerFromFaqs } from "@/lib/store"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { sessionId: incoming, text } = body as { sessionId?: string; text?: string }
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 })
  }

  const session = db.ensureSession(incoming)
  // persist user message
  db.addMessage(session.id, "user", text)

  const { answer } = answerFromFaqs(text)
  if (answer) {
    db.addMessage(session.id, "bot", answer)
    // mark as resolved for demo if we answered
    const s = db.getSession(session.id)
    if (s) s.resolved = true
    return NextResponse.json({ sessionId: session.id })
  }

  // escalate if no FAQ match
  const escalateMsg = "I’m connecting you to a human agent for better assistance…"
  db.addMessage(session.id, "bot", escalateMsg)
  const s = db.getSession(session.id)
  if (s) s.escalated = true

  return NextResponse.json({ sessionId: session.id })
}
