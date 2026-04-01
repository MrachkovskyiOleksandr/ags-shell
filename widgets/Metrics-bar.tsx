import app from "ags/gtk4/app"
import { Astal, Gdk, Gtk } from "ags/gtk4"

import { createState } from "ags"
import { pointer } from "../utils/format"
import { cpu, gpu, ram } from "./Metrics-Bar/metrics"

export default function MetricsBar(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const [visible, setVisible] = createState(false)

  return (
    <window
      visible
      namespace="metrics-bar"
      class="Metrics-Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | RIGHT}
      application={app}
    >
      <box halign={Gtk.Align.END}>
        <revealer
          revealChild={visible}
          transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
          transitionDuration={100}
        >
          <box visible={visible} cssClasses={["array"]} spacing={4}>
            <label label={cpu.as((v) => `CPU: ${v}%`)} />
            <box cssClasses={["separator"]} />
            <label label={gpu.as((v) => `GPU: ${v.used}% ${v.temp}°C`)} />
            <box cssClasses={["separator"]} />
            <label
              label={ram.as(
                (v) =>
                  `RAM: ${v.used.toFixed(2)}GB / ${v.total.toFixed(0)}GB (${v.percent}%)`,
              )}
            />
          </box>
        </revealer>
        <box
          cursor={pointer}
          cssClasses={visible.as((v) =>
            v ? ["toggle", "active"] : ["toggle"],
          )}
        >
          <togglebutton
            active={visible}
            onToggled={(self) => {
              setVisible((visible) => !visible)
              const win = self.get_ancestor(Gtk.Window.$gtype) as Gtk.Window
              win?.set_default_size(1, 1)
            }}
          >
            <image
              iconName={visible.as((v) =>
                v ? "pan-end-symbolic" : "pan-start-symbolic",
              )}
            />
          </togglebutton>
        </box>
      </box>
    </window>
  )
}
