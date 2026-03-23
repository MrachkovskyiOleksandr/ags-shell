import { createBinding, Accessor } from "ags"
import { Gtk } from "ags/gtk4"
import { pointer } from "../../utils/format"
import { audioIcon, device } from "../../utils/audio"

export default function Audio() {
  const volume = createBinding(device, "volume").as((b) => {
    return `Volume: ${Math.floor(b * 100)}%`
  })

  return (
    <box cssClasses={["audio-box"]} visible={true} tooltipText={volume}>
      <menubutton cursor={pointer}>
        <image iconName={audioIcon} />
        <popover hasArrow={false}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label cssClasses={["header"]} label={volume}></label>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
              <slider
                orientation={Gtk.Orientation.HORIZONTAL}
                hexpand
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
        </popover>
      </menubutton>
    </box>
  )
}
