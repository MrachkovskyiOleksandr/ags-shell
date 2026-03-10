import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"

import Battery from "./Bar/battery"
import Clock from "./Bar/clock"
import Wireless from "./Bar/network"
import Bluetooth from "./Bar/bluetooth"
import Audio from "./Bar/audio"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      namespace="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <box cssClasses={["center-box"]} halign={Gtk.Align.CENTER}>
        <Clock />
        <box hexpand />
        <Audio />
        <Bluetooth />
        <Wireless />
        <Battery />
      </box>
    </window>
  )
}
