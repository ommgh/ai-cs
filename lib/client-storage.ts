"use client"

import { createStore, get, set, del } from "idb-keyval"

type Msg = { id: string; sender: "user" | "bot" | "human"; text: string; timestamp: number }
type ChatSessionMeta = { id: string; title: string; updatedAt: number; lastMessage?: string }

const store = createStore("ai-support", "messages")
const SESSIONS_INDEX_KEY = "sessions:index"

function key(sessionId: string) {
  return `msgs:${sessionId}`
}

async function loadIndex(): Promise<ChatSessionMeta[]> {
  try {
    const idx = await get<ChatSessionMeta[]>(SESSIONS_INDEX_KEY, store)
    if (Array.isArray(idx)) return idx
  } catch (_e) {}
  try {
    const raw = localStorage.getItem(SESSIONS_INDEX_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_e) {}
  return []
}

async function saveIndex(index: ChatSessionMeta[]) {
  try {
    await set(SESSIONS_INDEX_KEY, index, store)
  } catch (_e) {}
  try {
    localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(index))
  } catch (_e) {}
}

function deriveMeta(sessionId: string, messages: Msg[]): ChatSessionMeta {
  const firstUser = messages.find((m) => m.sender === "user")
  const title = firstUser?.text?.slice(0, 40) || "New Chat"
  const last = messages[messages.length - 1]
  return {
    id: sessionId,
    title,
    updatedAt: last?.timestamp || Date.now(),
    lastMessage: last?.text?.slice(0, 80),
  }
}

export async function loadMessages(sessionId: string): Promise<Msg[]> {
  try {
    const val = await get<Msg[]>(key(sessionId), store)
    if (Array.isArray(val)) return val
  } catch (_e) {}
  try {
    const raw = localStorage.getItem(key(sessionId))
    if (raw) return JSON.parse(raw)
  } catch (_e) {}
  return []
}

export async function saveMessages(sessionId: string, messages: Msg[]) {
  try {
    await set(key(sessionId), messages, store)
  } catch (_e) {}
  try {
    localStorage.setItem(key(sessionId), JSON.stringify(messages))
  } catch (_e) {}

  // upsert sessions index
  const idx = await loadIndex()
  const meta = deriveMeta(sessionId, messages)
  const existing = idx.findIndex((s) => s.id === sessionId)
  if (existing >= 0) {
    idx[existing] = meta
  } else {
    idx.push(meta)
  }
  // sort by most recent
  idx.sort((a, b) => b.updatedAt - a.updatedAt)
  await saveIndex(idx)
}

export async function clearMessages(sessionId: string) {
  try {
    await del(key(sessionId), store)
  } catch (_e) {}
  try {
    localStorage.removeItem(key(sessionId))
  } catch (_e) {}

  const idx = await loadIndex()
  const next = idx.filter((s) => s.id !== sessionId)
  await saveIndex(next)
}

export async function listSessions(): Promise<ChatSessionMeta[]> {
  const idx = await loadIndex()
  // ensure most recent first
  return idx.sort((a, b) => b.updatedAt - a.updatedAt)
}
