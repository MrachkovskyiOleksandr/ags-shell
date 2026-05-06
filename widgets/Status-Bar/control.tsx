import { createBinding, Accessor, createState } from "ags"
import { Gtk } from "ags/gtk4"
import { pointer } from "../../utils/format"
import { audioIcon, device } from "../../utils/audio"
import { execAsync } from "ags/process"
import { brightness, max, percentage } from "../../utils/display"
import { MyPopover } from "../../utils/custom-elements"

const savedTemp = await execAsync("hyprctl hyprsunset profile")
  .then((out) => Number(out.match(/temperature:\s*(\d+)/)?.[1] ?? 6500))
  .catch(() => 6500)

const [temp, setTemp] = createState(savedTemp)

export default function Control() {
  const volume = createBinding(device, "volume").as((b) => {
    return `${Math.floor(b * 100)}`
  })

  return (
    <box cssClasses={["control-box"]} tooltipText={volume}>
      <menubutton cursor={pointer}>
        <box spacing={6}>
          <image iconName={"display-brightness"} />
          <image iconName={audioIcon} />
        </box>
        <MyPopover hasArrow={false} yoffset={14}>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <box
              cssClasses={["audio-section"]}
              orientation={Gtk.Orientation.HORIZONTAL}
              spacing={4}
            >
              <label cssClasses={["percentage"]} label={volume}></label>
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
            <box
              cssClasses={["screen-section"]}
              orientation={Gtk.Orientation.HORIZONTAL}
              spacing={4}
            >
              <label
                cssClasses={["percentage"]}
                label={percentage.as((p) => p.toString())}
              ></label>
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
              <menubutton cssClasses={["night-light"]}>
                <image iconName={"night-light"} />
                <MyPopover hasArrow={false} yoffset={8} xoffset={-134}>
                  <box cssClasses={["night-light-slider"]}>
                    <label
                      cssClasses={["percentage"]}
                      label={temp.as((t) => `${Math.floor(t)}K`)}
                    />
                    <slider
                      hexpand
                      min={1000}
                      max={6500}
                      value={temp}
                      onChangeValue={(self, _scrollType, value) => {
                        setTemp(value)
                        void execAsync(
                          `hyprctl hyprsunset temperature ${value}`,
                        ).catch(() => {
                          console.log("bruh")
                        })
                      }}
                    />
                  </box>
                </MyPopover>
              </menubutton>
            </box>
          </box>
        </MyPopover>
      </menubutton>
    </box>
  )
}
