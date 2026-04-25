import app from "ags/gtk4/app"

import { Astal, Gdk, Gtk } from "ags/gtk4"
import { pointer } from "../utils/format"
import {
  icon,
  body,
  setVisible,
  summary,
  visible,
  category,
  value,
} from "./Notification-Popup/notification"
import { createEffect } from "ags"

export default function Notification(gdkmonitor: Gdk.Monitor) {
  const { BOTTOM } = Astal.WindowAnchor

  let winRef: Astal.Window

  createEffect(() => {
    winRef?.set_default_size(1, 1)
  })

  return (
    <window
      visible={visible}
      namespace="notification-popup"
      class="Notification-Popup"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={BOTTOM}
      marginBottom={150}
      application={app}
      cursor={pointer}
      $={(self) => {
        winRef = self
        const gesture = new Gtk.GestureClick()
        gesture.connect("pressed", () => setVisible(false))
        self.add_controller(gesture)
      }}
    >
      <box
        orientation={category.as((c) =>
          c ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL,
        )}
        cssClasses={category.as((c) => (c ? ["system"] : ["program"]))}
      >
        <image iconName={icon} visible={icon.as((i) => i != "")} />
        <box cssClasses={["content"]} orientation={Gtk.Orientation.VERTICAL}>
          <label
            cssClasses={["summary"]}
            label={summary}
            visible={summary.as((v) => v != "")}
          />
          <label
            cssClasses={["body"]}
            label={body}
            visible={body.as((v) => v != "")}
            max_width_chars={20}
          />
          <slider
            visible={value.as((v) => v != 0)}
            hexpand
            value={value}
            heightRequest={20}
            max={100}
          />
        </box>
      </box>
    </window>
  )
}
