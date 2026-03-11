import { Gtk, Gdk } from "ags/gtk4"
import GLib from "gi://GLib"

import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widgets/Bar"
import ncgui from "./widgets/ncgui/ncgui"

Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!).add_search_path(
  `${GLib.get_home_dir()}/.config/ags/icons`
)

app.start({
  css: style,
  main() {
    app.get_monitors().map(Bar)
    ncgui()
  },
})
