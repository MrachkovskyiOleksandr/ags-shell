import AstalWp from "gi://AstalWp?version=0.1"
import { createBinding, Accessor } from "ags"
import { Gtk } from "ags/gtk4"
import { pointer } from "../../utils/format"

const wp = AstalWp.get_default()?.audio
const device = wp.default_speaker

export default function Audio() {
  const volume = createBinding(device, "volume").as((b) => {
    return `Volume: ${Math.floor(b * 100)}%`
  })

  return (
    <box cssClasses={["audio-box"]} visible={true} tooltipText={volume}>
      <menubutton cursor={pointer}>
        <image iconName={createBinding(device, "volumeIcon")} />
        <popover hasArrow={false}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <box cssClasses={["header" , "volume"]} halign={Gtk.Align.CENTER}  >
              <label label={volume}></label>
              {/* ToDo Mute button */}
            </box>
            <slider
              orientation={Gtk.Orientation.HORIZONTAL}
              value={createBinding(device, "volume")}
              min={0}
              max={1}
              onChangeValue={({ value }) => device.set_volume(value)}
            />
          </box>
        </popover>
      </menubutton>
    </box>
  )
}
