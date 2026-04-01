import GLib from "gi://GLib"
import { createState } from "ags"

let prevTotal = 0
let prevIdle = 0

function readCpuUsage(): number {
  const [, contents] = GLib.file_get_contents("/proc/stat")
  const line = new TextDecoder().decode(contents).split("\n")[0]
  const parts = line.trim().split(/\s+/).slice(1).map(Number)

  const idle = parts[3] + parts[4]
  const total = parts.reduce((a, b) => a + b, 0)

  const diffTotal = total - prevTotal
  const diffIdle = idle - prevIdle

  prevTotal = total
  prevIdle = idle

  return Math.round(((diffTotal - diffIdle) / diffTotal) * 100)
}

function readGpuUsage(): { used: number; temp: number } {
  try {
    const [, usageContents] = GLib.file_get_contents(
      "/sys/class/drm/card1/device/gpu_busy_percent",
    )
    const [, tempContents] = GLib.file_get_contents(
      "/sys/class/drm/card1/device/hwmon/hwmon5/temp1_input",
    )

    return {
      used: parseInt(new TextDecoder().decode(usageContents).trim()),
      temp: Math.round(
        parseInt(new TextDecoder().decode(tempContents).trim()) / 1000,
      ),
    }
  } catch {
    return { used: 0, temp: 0 }
  }
}

function readRamUsage(): { used: number; total: number; percent: number } {
  const [, contents] = GLib.file_get_contents("/proc/meminfo")
  const lines = new TextDecoder().decode(contents).split("\n")

  const getValue = (key: string) => {
    const line = lines.find((l) => l.startsWith(key))
    return parseInt(line?.split(/\s+/)[1] ?? "0")
  }

  const total = getValue("MemTotal:")
  const available = getValue("MemAvailable:")
  const used = total - available

  return {
    used: used / 1024 / 1024,
    total: total / 1024 / 1024,
    percent: Math.round((used / total) * 100),
  }
}

export const [cpu, setCpu] = createState(0)
export const [gpu, setGpu] = createState({ used: 0, temp: 0 })
export const [ram, setRam] = createState({ used: 0, total: 0, percent: 0 })

GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
  setCpu(readCpuUsage())
  setGpu(readGpuUsage())
  setRam(readRamUsage())
  return GLib.SOURCE_CONTINUE
})
