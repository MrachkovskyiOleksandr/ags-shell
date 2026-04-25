import Notifd from "gi://AstalNotifd"

import { createState } from "ags"

export const [summary, setSummary] = createState("")
export const [body, setBody] = createState("")
export const [icon, setIcon] = createState("")
export const [hint, setHint] = createState("")
export const [value, setValue] = createState(0)
export const [category, setCategory] = createState(false)
export const [timeout, setTimeout] = createState(0)
export const [visible, setVisible] = createState(false)

const notifd = Notifd.get_default()

let hideTimer: ReturnType<typeof globalThis.setTimeout> | null = null
const activeTimers = new Map<string, ReturnType<typeof globalThis.setTimeout>>()

let currentId: number | null = null

notifd.connect("notified", (_, id) => {
  const n = notifd.get_notification(id)
  const syncGroup = n?.hints
    .lookup_value("x-canonical-private-synchronous", null)
    ?.get_string()[0]

  const category = n?.hints.lookup_value("category", null)?.get_string()[0]

  const value = n?.hints.lookup_value("value", null)?.get_int32()

  if (category === "system") setCategory(true)
  else setCategory(false)

  if (syncGroup) {
    if (activeTimers.has(syncGroup)) {
      globalThis.clearTimeout(activeTimers.get(syncGroup)!)
      activeTimers.delete(syncGroup)
    }
  } else {
    if (hideTimer) {
      globalThis.clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  currentId = id
  setSummary(n?.summary || "")
  setBody(n?.body || "")
  setIcon(n?.image || "")
  setTimeout(n?.expire_timeout || 3000)
  setHint(syncGroup || "")
  setValue(value || 0)
  setVisible(true)

  const expireMs =
    n?.expire_timeout && n.expire_timeout > 0 ? n.expire_timeout : 3000
  const capturedId = id

  const timer = globalThis.setTimeout(() => {
    if (currentId === capturedId) setVisible(false)
    if (syncGroup) activeTimers.delete(syncGroup)
    else hideTimer = null
  }, expireMs)

  if (syncGroup) activeTimers.set(syncGroup, timer)
  else hideTimer = timer
})
