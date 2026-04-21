import Notifd from "gi://AstalNotifd"

import { createState } from "ags"

export const [summary, setSummary] = createState("")
export const [body, setBody] = createState("")
export const [icon, setIcon] = createState("")
export const [timeout, setTimeout] = createState(0)
export const [visible, setVisible] = createState(false)

const notifd = Notifd.get_default()

let hideTimer: ReturnType<typeof globalThis.setTimeout> | null = null
const activeTimers = new Map<string, ReturnType<typeof globalThis.setTimeout>>()

notifd.connect("notified", (_, id) => {
  const n = notifd.get_notification(id)
  const syncGroup = n?.hints
    .lookup_value("x-canonical-private-synchronous", null)
    ?.get_string()[0]

  if (syncGroup) {
    const existing = activeTimers.get(syncGroup)
    if (existing) globalThis.clearTimeout(existing)
  } else {
    if (hideTimer) globalThis.clearTimeout(hideTimer)
  }

  setSummary(n?.summary || "")
  setBody(n?.body || "")
  setIcon(n?.image || "")
  setTimeout(n?.expire_timeout || 3000)
  setVisible(true)

  if (hideTimer) globalThis.clearTimeout(hideTimer)

  if (n?.expire_timeout && n.expire_timeout > 0) {
    const timer = globalThis.setTimeout(() => {
      setVisible(false)
      if (syncGroup) activeTimers.delete(syncGroup)
    }, n.expire_timeout)

    if (syncGroup) activeTimers.set(syncGroup, timer)
    else hideTimer = timer
  } else {
    globalThis.setTimeout(() => {
      setVisible(false)
      if (syncGroup) activeTimers.delete(syncGroup)
    }, timeout())
  }
})
