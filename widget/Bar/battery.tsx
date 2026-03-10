import AstalBattery from "gi://AstalBattery"
import { createBinding } from "ags"
import { createPoll } from "ags/time"
import { Gdk } from "ags/gtk4"

export default function Battery() {
  const battery = AstalBattery.get_default()

  const percent = createBinding(
    battery,
    "percentage",
  )((p) => `${Math.floor(p * 100)}%`)

  const tooltipText = createPoll("", 3000, () => {
    const isCharging = battery.charging 
    
    if (!isCharging) {
      const h = Math.floor(battery.timeToEmpty / 3600)
      const m = Math.floor((battery.timeToEmpty % 3600) / 60)
      return `Empty in ${h}:${String(m).padStart(2, "0")}`
    } 
    else {
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
      <image iconName={createBinding(battery, "iconName")} />
      <label label={percent} />
    </box>
  )
}
