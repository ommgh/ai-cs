"use client"

import type React from "react"
import useSWR from "swr"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { loadMessages, saveMessages, listSessions } from "@/lib/client-storage"

type Msg = { id: string; sender: "user" | "bot" | "human"; text: string; timestamp: number }
type SessionRes = { sessionId: string; messages: Msg[] }
type ChatSessionMeta = { id: string; title: string; updatedAt: number; lastMessage?: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [localMsgs, setLocalMsgs] = useState<Msg[]>([])
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // restore session id
  useEffect(() => {
    const s = localStorage.getItem("chat_session_id")
    if (s) setSessionId(s)
  }, [])

  // load sidebar sessions
  useEffect(() => {
    ;(async () => {
      const idx = await listSessions()
      setSessions(idx)
    })()
  }, [])

  const { data, mutate } = useSWR<SessionRes>(sessionId ? `/api/sessions/${sessionId}` : null, fetcher, {
    refreshInterval: 0,
  })

  // hydrate local messages from storage when we have a sessionId
  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      const stored = await loadMessages(sessionId)
      if (stored?.length) setLocalMsgs(stored)
    })()
  }, [sessionId])

  // whenever server data changes, sync to local storage and local state
  useEffect(() => {
    if (!data?.sessionId) return
    setSessionId((prev) => {
      if (!prev) localStorage.setItem("chat_session_id", data.sessionId)
      return data.sessionId
    })
    if (data.messages) {
      setLocalMsgs(data.messages)
      saveMessages(data.sessionId, data.messages).then(async () => {
        const idx = await listSessions()
        setSessions(idx)
      })
    }
  }, [data?.sessionId, data?.messages])

  // scroll to bottom on message changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [localMsgs.length])

  const messages = useMemo(() => localMsgs, [localMsgs])

  async function sendMessage() {
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)

    // optimistic user message
    const optimistic: Msg = {
      id: `local_${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: Date.now(),
    }
    const optimisticList = [...messages, optimistic]
    setLocalMsgs(optimisticList)
    if (sessionId) {
      await saveMessages(sessionId, optimisticList)
      const idx = await listSessions()
      setSessions(idx)
    }
    setText("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, text: trimmed }),
      })
      const json: SessionRes | { sessionId?: string } = await res.json()
      if (json.sessionId && !sessionId) {
        localStorage.setItem("chat_session_id", json.sessionId!)
        setSessionId(json.sessionId!)
      }
      if ("sessionId" in json && json.sessionId) {
        await mutate() // refresh from server and triggers storage sync
      }
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function startNewSession() {
    // do not delete previous sessions; just clear current chat state
    setSessionId(null)
    localStorage.removeItem("chat_session_id")
    setLocalMsgs([])
    await mutate(undefined, { revalidate: false })
  }

  async function switchSession(id: string) {
    setSessionId(id)
    localStorage.setItem("chat_session_id", id)
    const msgs = await loadMessages(id)
    setLocalMsgs(msgs)
  }

  return (
    <main className="h-dvh w-full flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r flex-col">
        <div className="h-14 border-b flex items-center justify-between px-3">
          <h2 className="text-sm font-semibold">Chats</h2>
          <Button size="sm" variant="secondary" onClick={startNewSession}>
            New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {sessions.length === 0 && <li className="px-2 py-1 text-xs text-muted-foreground">No chats yet</li>}
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  className={`w-full text-left rounded-md px-2 py-2 text-sm hover:bg-muted ${
                    sessionId === s.id ? "bg-muted" : ""
                  }`}
                  onClick={() => switchSession(s.id)}
                >
                  <div className="truncate font-medium">{s.title}</div>
                  {s.lastMessage && <div className="truncate text-xs text-muted-foreground">{s.lastMessage}</div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Chat Pane */}
      <section className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Chat Support</h1>
          <Button variant="secondary" onClick={startNewSession}>
            New Chat
          </Button>
        </header>

        <div className="flex-1 flex flex-col">
          <Card className="flex-1 rounded-none border-0">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {!messages.length && <p className="text-sm text-muted-foreground">Start by asking a question…</p>}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-md px-3 py-2 max-w-[80%] text-sm ${
                        m.sender === "user"
                          ? "bg-blue-100 text-blue-900"
                          : m.sender === "human"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-muted text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area pinned to bottom */}
              <div className="border-t p-3 flex items-center gap-2">
                <Input
                  placeholder="Type your message…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending}>
                  {sending ? "Sending…" : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
