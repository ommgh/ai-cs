type ID = string

export type Message = {
  id: ID
  sessionId: ID
  sender: "user" | "bot" | "human"
  text: string
  timestamp: number
}

export type Session = {
  id: ID
  userId?: ID | null
  startedAt: number
  endedAt?: number | null
  escalated?: boolean
  resolved?: boolean
}

export type FAQ = {
  id: ID
  question: string
  answer: string
}

export type AdminSettings = {
  tone: "concise" | "friendly" | "professional"
  length: "short" | "medium" | "long"
  llmProvider?: string
  llmModel?: string
}

const store = {
  sessions: new Map<ID, Session>(),
  messages: new Map<ID, Message>(),
  faqs: new Map<ID, FAQ>(),
  adminUsers: new Map<string, { email: string; password: string }>(),
  settings: { tone: "professional", length: "short" } as AdminSettings,
}

// seed a demo admin
store.adminUsers.set("admin@example.com", { email: "admin@example.com", password: "admin1234" })
// seed a few FAQs
const seedFaqs: FAQ[] = [
  { id: "f1", question: "What are your support hours?", answer: "We provide 24/7 support." },
  { id: "f2", question: "How can I reset my password?", answer: "Use the “Forgot password” link on the login page." },
  {
    id: "f3",
    question: "Do you offer refunds?",
    answer: "Yes, within 30 days of purchase — contact support with your order ID.",
  },
]
for (const f of seedFaqs) store.faqs.set(f.id, f)

function uid(prefix = "id"): ID {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export const db = {
  // sessions
  getSessions(): Session[] {
    return Array.from(store.sessions.values()).sort((a, b) => b.startedAt - a.startedAt)
  },
  getSession(id: ID): Session | undefined {
    return store.sessions.get(id)
  },
  ensureSession(id?: ID): Session {
    if (id && store.sessions.has(id)) return store.sessions.get(id)!
    const newSession: Session = { id: uid("s"), startedAt: Date.now(), escalated: false, resolved: false }
    store.sessions.set(newSession.id, newSession)
    return newSession
  },
  endSession(id: ID) {
    const s = store.sessions.get(id)
    if (s) {
      s.endedAt = Date.now()
      store.sessions.set(id, s)
    }
  },

  // messages
  getMessagesBySession(sessionId: ID): Message[] {
    return Array.from(store.messages.values())
      .filter((m) => m.sessionId === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp)
  },
  addMessage(sessionId: ID, sender: Message["sender"], text: string): Message {
    const m: Message = { id: uid("m"), sessionId, sender, text, timestamp: Date.now() }
    store.messages.set(m.id, m)
    return m
  },

  // faqs
  listFaqs(): FAQ[] {
    return Array.from(store.faqs.values()).sort((a, b) => a.question.localeCompare(b.question))
  },
  createFaq(data: Omit<FAQ, "id">): FAQ {
    const f: FAQ = { ...data, id: uid("f") }
    store.faqs.set(f.id, f)
    return f
  },
  updateFaq(id: ID, data: Partial<Omit<FAQ, "id">>): FAQ | undefined {
    const f = store.faqs.get(id)
    if (!f) return undefined
    const updated = { ...f, ...data }
    store.faqs.set(id, updated)
    return updated
  },
  deleteFaq(id: ID) {
    return store.faqs.delete(id)
  },

  // admin/auth
  validateAdmin(email: string, password: string): boolean {
    const rec = store.adminUsers.get(email)
    return !!rec && rec.password === password
  },

  // settings
  getSettings(): AdminSettings {
    return store.settings
  },
  setSettings(patch: Partial<AdminSettings>) {
    store.settings = { ...store.settings, ...patch }
  },

  // analytics helpers
  computeAnalytics() {
    const sessions = Array.from(store.sessions.values())
    const total = sessions.length
    const escalated = sessions.filter((s) => s.escalated).length
    const resolved = sessions.filter((s) => s.resolved).length
    return { totalSessions: total, escalated, resolved }
  },
}

// naive FAQ matcher
export function answerFromFaqs(input: string): { answer?: string; matched?: FAQ } {
  const txt = input.toLowerCase()
  let best: FAQ | undefined
  for (const f of db.listFaqs()) {
    const q = f.question.toLowerCase()
    if (txt.includes(q.split(" ")[0] || "") || q.includes(txt)) {
      best = f
      break
    }
  }
  if (best) return { answer: best.answer, matched: best }
  return {}
}
