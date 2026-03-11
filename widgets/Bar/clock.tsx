import { createPoll } from "ags/time"
import GLib from "gi://GLib?version=2.0"
import { Gtk, Gdk } from "ags/gtk4"

export default function Clock({ format = "%A - %H:%M" }) {
  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format(format)!
  })

  return (
    <menubutton
      cursor={Gdk.Cursor.new_from_name("pointer", null)}
      cssClasses={["clock-box"]}
    >
      <label label={time} />
      <popover
        cssClasses={["popover"]}
      >
        <Gtk.Calendar />
      </popover>
    </menubutton>
  )
}
