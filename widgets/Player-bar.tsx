import app from "ags/gtk4/app"
import Pango from "gi://Pango?version=1.0"

import { Astal, Gdk, Gtk } from "ags/gtk4"
import { createEffect } from "ags"
import {
  activePlayer,
  artist,
  canGoNext,
  canGoPrevious,
  coverArt,
  fewSources,
  isPlaying,
  length,
  position,
  selectNext,
  selectPrevious,
  title,
} from "./Player-Bar/player"
import { pointer } from "../utils/format"

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
              cursor={pointer}
              halign={Gtk.Align.START}
              ellipsize={Pango.EllipsizeMode.END}
              label={title}
              $={(self) => (labelRef = self)}
            />
            <popover hasArrow={false}>
              <box
                cssClasses={["player-popover"]}
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={6}
              >
                <box>
                  <button
                    cursor={pointer}
                    visible={fewSources}
                    onClicked={selectPrevious}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                  >
                    <image iconName={"pan-start-symbolic"} />
                  </button>
                </box>
                <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
                  <box spacing={20}>
                    <image
                      halign={Gtk.Align.CENTER}
                      valign={Gtk.Align.CENTER}
                      cssClasses={["cover"]}
                      visible={coverArt.as((c) => (c != "" ? true : false))}
                      file={coverArt}
                      pixel_size={60}
                    />
                    <box
                      cssClasses={["info"]}
                      vexpand
                      hexpand
                      orientation={Gtk.Orientation.VERTICAL}
                      valign={Gtk.Align.CENTER}
                    >
                      <label
                        cssClasses={["title"]}
                        wrap
                        max_width_chars={30}
                        xalign={0}
                        yalign={1}
                        label={title}
                      />
                      <label
                        cssClasses={["artist"]}
                        wrap
                        max_width_chars={30}
                        xalign={0}
                        label={artist}
                      />
                    </box>

                    <button
                      cssClasses={["play-pause"]}
                      cursor={pointer}
                      widthRequest={34}
                      heightRequest={34}
                      halign={Gtk.Align.CENTER}
                      valign={Gtk.Align.CENTER}
                      onClicked={() => activePlayer?.play_pause()}
                    >
                      <image
                        iconName={isPlaying.as((p) =>
                          p
                            ? "media-playback-pause-symbolic"
                            : "media-playback-start-symbolic",
                        )}
                      />
                    </button>
                  </box>
                  <box cssClasses={["controls"]} spacing={20}>
                    <button
                      cursor={pointer}
                      visible={canGoPrevious}
                      onClicked={() => activePlayer?.previous()}
                    >
                      <image iconName={"media-skip-backward-symbolic"} />
                    </button>
                    <slider
                      cssClasses={["timeline"]}
                      hexpand
                      cursor={pointer}
                      value={position}
                      max={length}
                      heightRequest={20}
                      onChangeValue={(self) =>
                        activePlayer?.set_position(self.value)
                      }
                    />
                    <button
                      cursor={pointer}
                      visible={canGoNext}
                      onClicked={() => activePlayer?.next()}
                    >
                      <image iconName={"media-skip-forward-symbolic"} />
                    </button>
                  </box>
                </box>

                <box>
                  <button
                    cursor={pointer}
                    visible={fewSources}
                    onClicked={selectNext}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                  >
                    <image iconName={"pan-end-symbolic"} />
                  </button>
                </box>
              </box>
            </popover>
          </menubutton>
        </revealer>
      </box>
    </window>
  )
}
