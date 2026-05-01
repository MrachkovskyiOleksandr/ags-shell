import { createBinding, Accessor } from "ags"
import { Gtk } from "ags/gtk4"
import { pointer } from "../../utils/format"
import { audioIcon, device } from "../../utils/audio"
import { execAsync } from "ags/process"
import { brightness, max } from "../../utils/display"

export default function Control() {
  const volume = createBinding(device, "volume").as((b) => {
    return `Volume: ${Math.floor(b * 100)}%`
  })

  return (
    <box cssClasses={["control-box"]} tooltipText={volume}>
      <menubutton cursor={pointer}>
        <box spacing={6}>
          <image iconName={"display-brightness"} />
          <image iconName={audioIcon} />
        </box>
        <popover hasArrow={false}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <box
              cssClasses={["audio-section"]}
              orientation={Gtk.Orientation.VERTICAL}
            >
              <label cssClasses={["header"]} label={volume}></label>
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
                <slider
                  hexpand
                  cursor={pointer}
                  value={createBinding(device, "volume")}
                  min={0}
                  max={1}
                  onChangeValue={({ value }) => device.set_volume(value)}
                />
                <button
                  cssClasses={createBinding(device, "mute").as((m) =>
                    m ? ["mute-button", "muted"] : ["mute-button"],
                  )}
                  cursor={pointer}
                  onClicked={() => {
                    device.set_mute(!device.mute)
                  }}
                >
                  <image iconName={audioIcon}></image>
                </button>
              </box>
            </box>
            <box
              cssClasses={["screen-section"]}
              orientation={Gtk.Orientation.VERTICAL}
            >
              <label
                cssClasses={["header"]}
                label={""}
              ></label>
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
                <slider
                  hexpand
                  cursor={pointer}
                  value={brightness}
                  min={0}
                  max={max}
                  onChangeValue={(self, _scrollType, value) =>
                    void execAsync(`brightnessctl set ${Math.round(value)}`)
                  }
                  $={(self) => {
                    self.set_increments(5, 5)
                  }}
                />
                <button cssClasses={["night-light-button"]}>
                  <image iconName={"night-light"} />
                </button>
              </box>
            </box>
          </box>
        </popover>
      </menubutton>
    </box>
  )
}
