import AstalBattery from "gi://AstalBattery"

import { createBinding, createState } from "ags"
import { createPoll } from "ags/time"
import { Gdk } from "ags/gtk4"

const getBatteryIcon = (percent: number, charging: boolean) => {
  if (percent >= 100)
    return charging
      ? "battery-level-100-charged-symbolic"
      : "battery-level-100-symbolic"

  const level = Math.round(percent / 10) * 10
  return charging
    ? `battery-level-${level}-charging-symbolic`
    : `battery-level-${level}-symbolic`
}

export default function Battery() {
  const battery = AstalBattery.get_default()

  const percent = createBinding(
    battery,
    "percentage",
  )((p) => `${Math.floor(p * 100)}%`)

  const [icon, setIcon] = createState(
    getBatteryIcon(Math.round(battery.percentage * 100), battery.charging),
  )

  battery.connect("notify::percentage", () =>
    setIcon(
      getBatteryIcon(Math.round(battery.percentage * 100), battery.charging),
    ),
  )
  battery.connect("notify::charging", () =>
    setIcon(
      getBatteryIcon(Math.round(battery.percentage * 100), battery.charging),
    ),
  )

  const tooltipText = createPoll("", 3000, () => {
    const isCharging = battery.charging

    if (!isCharging) {
      const h = Math.floor(battery.timeToEmpty / 3600)
      const m = Math.floor((battery.timeToEmpty % 3600) / 60)
      return `Empty in ${h}:${String(m).padStart(2, "0")}`
    } else {
      const h = Math.floor(battery.timeToFull / 3600)
      const m = Math.floor((battery.timeToFull % 3600) / 60)
      return `Full in ${h}:${String(m).padStart(2, "0")}`
    }
  })

  return (
    <box
      cursor={Gdk.Cursor.new_from_name("pointer", null)}
      cssClasses={["battery-box"]}
      tooltipText={tooltipText}
    >
      <image iconName={icon} />
      <label label={percent} />
    </box>
  )
}
