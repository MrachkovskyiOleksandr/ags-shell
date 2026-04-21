import { Gtk, Gdk } from "ags/gtk4"
import GLib from "gi://GLib"

import app from "ags/gtk4/app"
import style from "./style.scss"
import StatusBar from "./widgets/Status-bar"
import ncgui from "./widgets/ncgui/ncgui"
import MetricsBar from "./widgets/Metrics-bar"
import PlayerBar from "./widgets/Player-bar"
import Notification from "./widgets/Notification-Popup"


Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!).add_search_path(
  `${GLib.get_home_dir()}/.config/ags/icons`
)

app.start({
  css: style,
  main() {
    app.get_monitors().map(StatusBar)
    app.get_monitors().map(MetricsBar)
    app.get_monitors().map(PlayerBar)
    app.get_monitors().map(Notification)
    ncgui()
  },
})
