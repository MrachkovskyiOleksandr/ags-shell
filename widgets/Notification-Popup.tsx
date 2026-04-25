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
import { Accessor, createEffect, createMemo } from "ags"

export default function Notification(gdkmonitor: Gdk.Monitor) {
  const { BOTTOM } = Astal.WindowAnchor

  let winRef: Astal.Window

  const asClass = (accessor: Accessor<boolean>, t: any, f: any) =>
    accessor.as((v) => (v ? t : f))

  const isFilePath = (v: string) => v.startsWith("/") || v.startsWith("~")

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
        orientation={asClass(
          category,
          Gtk.Orientation.VERTICAL,
          Gtk.Orientation.HORIZONTAL,
        )}
        cssClasses={asClass(category, ["system"], ["program"])}
        spacing={6}
      >
        <image
          file={icon.as((v) => (isFilePath(v) ? v : ""))}
          visible={icon.as(isFilePath)}
        />
        <image
          iconName={icon.as((v) => (isFilePath(v) ? "" : v))}
          visible={icon.as((v) => !isFilePath(v))}
        />
        <box cssClasses={["content"]} orientation={Gtk.Orientation.VERTICAL}>
          <label
            cssClasses={["summary"]}
            hexpand
            xalign={asClass(category, 0.5, 0)}
            label={summary}
            visible={summary.as((v) => v != "")}
          />
          <label
            cssClasses={["body"]}
            label={body}
            xalign={asClass(category, 0.5, 0)}
            visible={body.as((v) => v != "")}
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
