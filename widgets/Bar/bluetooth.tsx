import AstalBluetooth from "gi://AstalBluetooth"
import Pango from "gi://Pango?version=1.0"

import { createBinding, For } from "ags"
import { Gtk } from "ags/gtk4"
import { timeout } from "ags/time"
import { pointer } from "../../utils/format"
import { adapter, bluetoothIcon, powered, sortedDevices } from "../../utils/bluetooth"

export default function Bluetooth() {

  return (
    <box cssClasses={["bluetooth-box"]}>
      <menubutton cursor={pointer}>
        <image iconName={bluetoothIcon} />

        <popover hasArrow={false}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <box cssClasses={["header"]} valign={Gtk.Align.CENTER}>
              <label label="Bluetooth" hexpand halign={Gtk.Align.START} />
              <switch
                cursor={pointer}
                hexpand
                halign={Gtk.Align.END}
                active={powered}
                onNotifyActive={({ active }) => {
                  if (active !== powered()) {
                    adapter.set_powered(active)
                  }
                }}
              />
              <button
                visible={powered}
                cssClasses={["refresh-btn"]}
                cursor={pointer}
                onClicked={() => {
                  if (adapter.discovering) {
                    adapter.stop_discovery()
                  } else {
                    adapter.start_discovery()
                    timeout(10000, () => adapter.stop_discovery())
                  }
                }}
              >
                <box spacing={6}>
                  <image
                    iconName="refresh-icon-symbolic"
                    cssClasses={createBinding(adapter, "discovering").as((s) =>
                      s ? ["spinning"] : [],
                    )}
                  />
                  <label label="Refresh" />
                </box>
              </button>
            </box>

            <box orientation={Gtk.Orientation.VERTICAL}>
              <For each={sortedDevices}>
                {(device: AstalBluetooth.Device) => {
                  const battery = createBinding(device, "batteryPercentage")
                  return (
                    <button
                      cssClasses={["bluetooth-list-item"]}
                      cursor={pointer}
                      onClicked={() =>
                        timeout(100, () => device.connect_device(() => {}))
                      }
                    >
                      <box spacing={4} hexpand>
                        <image
                          iconName={
                            device.icon
                              ? `${device.icon}-symbolic`
                              : "bluetooth-symbolic"
                          }
                        />
                        <label
                          maxWidthChars={22}
                          ellipsize={Pango.EllipsizeMode.END}
                          label={device.name}
                          tooltipText={device.name}
                        />
                        <label
                          cssClasses={["battery-label"]}
                          visible={battery.as((p) => p > 0)}
                          label={battery.as((p) => `(${Math.round(p * 100)}%)`)}
                        />
                        <image
                          iconName="object-select-symbolic"
                          hexpand
                          halign={Gtk.Align.END}
                          visible={createBinding(device, "connected")}
                        />
                      </box>
                    </button>
                  )
                }}
              </For>
            </box>
          </box>
        </popover>
      </menubutton>
    </box>
  )
}
