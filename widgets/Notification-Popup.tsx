import app from "ags/gtk4/app"

import { Astal, Gdk, Gtk } from "ags/gtk4"
import { pointer } from "../utils/format"
import {
  icon,
  body,
  setVisible,
  summary,
  visible,
} from "./Notification-Popup/notification"

export default function Notification(gdkmonitor: Gdk.Monitor) {
  const { BOTTOM } = Astal.WindowAnchor

  return (
    <window
      visible={visible}
      namespace="notification-popup"
      class="Notification-Popup"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={BOTTOM}
      application={app}
    >
      <box
        cursor={pointer}
        $={(self) => {
          const gesture = new Gtk.GestureClick()
          gesture.connect("pressed", () => setVisible(false))
          self.add_controller(gesture)
        }}
      >
        {/* <image icon_name={appIcon} /> */}
        <image iconName={icon} visible={icon.as((v) => v != "")} />
        <box orientation={Gtk.Orientation.VERTICAL}>
          <label
            xalign={0}
            label={summary}
            visible={summary.as((v) => v != "")}
          />
          <label xalign={0} label={body} visible={body.as((v) => v != "")} />
          {/* <label xalign={0} label={timeout.as((t) => `To expire - ${t}`)} /> */}
        </box>
      </box>
    </window>
  )
}
