import AstalBluetooth from "gi://AstalBluetooth"
import { createBinding, createComputed, For } from "ags"
import { Gdk, Gtk } from "ags/gtk4"
import { timeout } from "ags/time"

const bluetooth = AstalBluetooth.get_default()

export default function Bluetooth() {
  const adapter = bluetooth.adapter
  const powered = createBinding(adapter, "powered")
  const devices = createBinding(bluetooth, "devices")

  const bluetoothIcon = createComputed(() => {
    if (!powered()) return "bluetooth-disabled-symbolic"
    const connected = devices().some((d) => createBinding(d, "connected")())
    return connected ? "bluetooth-connected-symbolic" : "bluetooth-symbolic"
  })

  const sortedDevices = createComputed(() =>
    devices()
      .filter((d) => d.name !== null)
      .sort((a, b) => Number(b.connected) - Number(a.connected)),
  )

  return (
    <box cssClasses={["bluetooth-box"]}>
      <menubutton cursor={Gdk.Cursor.new_from_name("pointer", null)}>
        <image iconName={bluetoothIcon} />

        <popover hasArrow={false}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <box cssClasses={["header"]} valign={Gtk.Align.CENTER}>
              <label label="Bluetooth" hexpand halign={Gtk.Align.START} />
              <switch
                cursor={Gdk.Cursor.new_from_name("pointer", null)}
                hexpand
                halign={Gtk.Align.END}
                active={powered()}
                onNotifyActive={({ active }) => {
                  if (active !== powered()) {
                    adapter.set_powered(active)
                  }
                }}
              />
              <button
                cssClasses={["refresh-btn"]}
                cursor={Gdk.Cursor.new_from_name("pointer", null)}
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
                      cursor={Gdk.Cursor.new_from_name("pointer", null)}
                      onClicked={() =>
                        timeout(100, () => device.connect_device(() => {}))
                      }
                    >
                      <box spacing={8}>
                        <image
                          iconName={
                            device.icon
                              ? `${device.icon}-symbolic`
                              : "bluetooth-symbolic"
                          }
                        />
                        <label label={device.name} />
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
