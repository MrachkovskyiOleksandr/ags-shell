import app from "ags/gtk4/app"
import Pango from "gi://Pango?version=1.0"

import { Astal, Gdk, Gtk } from "ags/gtk4"
import { createEffect } from "ags"
import {
  activePlayer,
  artist,
  coverArt,
  length,
  position,
  title,
} from "./Player-Bar/player"

export default function PlayerBar(gdkmonitor: Gdk.Monitor) {
  const { LEFT, TOP } = Astal.WindowAnchor

  let labelRef: Gtk.Label
  let winRef: Astal.Window

  createEffect(() => {
    title()
    labelRef.width_request = -1
    const naturalWidth = labelRef?.get_preferred_size()[1]?.width ?? 0
    labelRef.width_request = Math.min(naturalWidth, 300)
    winRef?.set_default_size(1, 1)
  })

  return (
    <window
      visible
      namespace="player-bar"
      class="Player-Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={LEFT | TOP}
      application={app}
      $={(self) => (winRef = self)}
    >
      <box halign={Gtk.Align.START}>
        <revealer
          revealChild={title.as((t) => (t ? true : false))}
          transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
          transitionDuration={100}
        >
          <menubutton cssClasses={["player"]}>
            <label
              tooltipText={title}
              halign={Gtk.Align.START}
              ellipsize={Pango.EllipsizeMode.END}
              label={title}
              $={(self) => (labelRef = self)}
            />
            <popover>
              <box
                cssClasses={["player-popover"]}
                orientation={Gtk.Orientation.VERTICAL}
              >
                <box>
                  <image visible={coverArt.as((c) => c != "" ? true : false)} file={coverArt} />
                  <box
                    cssClasses={["info"]}
                    orientation={Gtk.Orientation.VERTICAL}
                  >
                    <label label={title} />
                    <label label={artist} />
                  </box>
                </box>
                <box cssClasses={["controls"]}>
                  <button onClicked={() => activePlayer?.previous()}>
                    <image iconName={"media-skip-backward-symbolic"} />
                  </button>
                  <button onClicked={() => activePlayer?.play_pause()}>
                    <image iconName={"media-playback-pause-symbolic"} />
                  </button>
                  <button onClicked={() => activePlayer?.next()}>
                    <image iconName={"media-skip-forward-symbolic"} />
                  </button>
                </box>
                <slider
                  cssClasses={["timeline"]}
                  value={position}
                  max={length}
                  onChangeValue={(self) =>
                    activePlayer?.set_position(self.value)
                  }
                />
              </box>
            </popover>
          </menubutton>
        </revealer>
      </box>
    </window>
  )
}
