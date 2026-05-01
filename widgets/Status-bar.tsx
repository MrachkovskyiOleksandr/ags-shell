import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"

import Battery from "./Status-Bar/battery"
import Clock from "./Status-Bar/clock"
import Wireless from "./Status-Bar/network"
import Bluetooth from "./Status-Bar/bluetooth"
import Control from "./Status-Bar/control"
import Workspaces from "./Status-Bar/workspaces"

export default function StatusBar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      namespace="status-bar"
      class="Status-Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <box cssClasses={["center-box"]} halign={Gtk.Align.CENTER}>
        <Clock />
        <box hexpand />
        <Workspaces />
        <box hexpand />
        <box spacing={8}>
          <Control />
          <Bluetooth />
          <Wireless />
          <Battery />
        </box>
      </box>
    </window>
  )
}
