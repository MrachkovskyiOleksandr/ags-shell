import { createPoll } from "ags/time"
import GLib from "gi://GLib?version=2.0"
import { Gtk } from "ags/gtk4"
import { pointer } from "../../utils/format"

export default function Clock({ format = "%A - %H:%M" }) {
  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format(format)!
  })

  return (
    <menubutton
      cursor={pointer}
      cssClasses={["clock-box"]}
    >
      <label label={time} />
      <popover
        cssClasses={["popover"]}
        hasArrow={false}
      >
        <Gtk.Calendar />
      </popover>
    </menubutton>
  )
}
