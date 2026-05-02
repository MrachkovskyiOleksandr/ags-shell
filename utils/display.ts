import { createMemo, createState } from "ags"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"

export const [max, setMax] = createState(1)

execAsync("brightnessctl max").then((v) => setMax(Number(v)))

export const brightness = createPoll(0, 200, async (prev) => {
  const v = await execAsync("brightnessctl get")
  return Number(v)
})

export const percentage = createMemo(() => Math.floor((brightness() / max()) * 100))
