import AstalNetwork from "gi://AstalNetwork"
import GTop from "gi://GTop"
import Pango from "gi://Pango?version=1.0"

import { createBinding, createState, With, For } from "ags"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { Gtk, Gdk } from "ags/gtk4"

import { openNcgui } from "../ncgui/ncgui"

export default function Wireless() {
  const network = AstalNetwork.get_default()
  const wifi = createBinding(network, "wifi")

  const sorted = (arr: Array<AstalNetwork.AccessPoint>) => {
    return arr.filter((ap) => !!ap.ssid).sort((a, b) => b.strength - a.strength)
  }

  async function connect(ap: AstalNetwork.AccessPoint) {
    try {
      await execAsync(`nmcli d wifi connect ${ap.bssid}`)
    } catch (error) {
      console.error(error)
    }
  }

  const getIface = () => {
    const ifaces = GTop.glibtop_get_netlist(new GTop.glibtop_netlist())
    return ifaces.find((i: string) => i !== "lo") ?? "wlan0"
  }

  const IFACE = getIface()
  const netLoad = new GTop.glibtop_netload()
  let prevRx = 0
  let prevTx = 0

  const formatSpeed = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B/s`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB/s`
  }

  const speed = createPoll({ down: "0 B/s", up: "0 B/s" }, 1000, () => {
    GTop.glibtop_get_netload(netLoad, IFACE)
    const down = formatSpeed(netLoad.bytes_in - prevRx)
    const up = formatSpeed(netLoad.bytes_out - prevTx)
    prevRx = netLoad.bytes_in
    prevTx = netLoad.bytes_out
    return { down, up }
  })

  return (
    <box
      cssClasses={["network-box"]}
      visible={wifi(Boolean)}
      tooltipText={speed.as((s) => ` ${s.down}\n ${s.up}`)}
    >
      <With value={wifi}>
        {(wifi) =>
          wifi && (
            <menubutton cursor={Gdk.Cursor.new_from_name("pointer", null)}>
              <image iconName={createBinding(wifi, "iconName")} />
              <popover hasArrow={false}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                  <box
                    cssClasses={["header"]}
                    valign={Gtk.Align.CENTER}
                    hexpand
                  >
                    <label label="WiFi" hexpand halign={Gtk.Align.START} />
                    <switch
                      hexpand
                      halign={Gtk.Align.END}
                      cursor={Gdk.Cursor.new_from_name("pointer", null)}
                      active={network.wifi.enabled}
                      onNotifyActive={({ active }) => {
                        if (active != network.wifi.enabled)
                          network.wifi.set_enabled(active)
                      }}
                    />
                    <button
                      cssClasses={["refresh-btn"]}
                      cursor={Gdk.Cursor.new_from_name("pointer", null)}
                      onClicked={() => wifi.scan()}
                    >
                      <box spacing={6}>
                        <image
                          iconName="refresh-icon-symbolic"
                          cssClasses={createBinding(wifi, "scanning").as((s) =>
                            s ? ["spinning"] : [],
                          )}
                        />
                        <label label="Refresh" />
                      </box>
                    </button>
                  </box>

                  <For each={createBinding(wifi, "accessPoints")(sorted)}>
                    {(ap: AstalNetwork.AccessPoint) => {
                      const [editHovered, setEditHovered] = createState(false)
                      const [itemHovered, setItemHovered] = createState(false)

                      return (
                        <button
                          cssClasses={editHovered.as((h) =>
                            h
                              ? ["wifi-list-item", "no-hover"]
                              : ["wifi-list-item"],
                          )}
                          cursor={Gdk.Cursor.new_from_name("pointer", null)}
                          onClicked={async () => {
                            try {
                              const saved = await execAsync(
                                `nmcli -s -g 802-11-wireless-security.psk connection show "${ap.ssid}"`,
                              )
                              if (saved.trim()) {
                                connect(ap)
                              } else {
                                openNcgui(ap)
                              }
                            } catch {
                              openNcgui(ap)
                            }
                          }}
                          onRealize={(self) => {
                            const motion = new Gtk.EventControllerMotion()
                            motion.connect("enter", () => setItemHovered(true))
                            motion.connect("leave", () => setItemHovered(false))
                            self.add_controller(motion)
                          }}
                        >
                          <box hexpand>
                            <box
                              spacing={4}
                              orientation={Gtk.Orientation.HORIZONTAL}
                              hexpand
                            >
                              <image
                                halign={Gtk.Align.START}
                                iconName={createBinding(ap, "iconName")}
                              />
                              <label
                                label={createBinding(ap, "ssid")}
                                maxWidthChars={17}
                                ellipsize={Pango.EllipsizeMode.END}
                                tooltipText={createBinding(ap, "ssid")}
                              />
                              <label
                                hexpand
                                halign={Gtk.Align.START}
                                cssClasses={["frequency-label"]}
                                label={createBinding(ap, "frequency").as(
                                  (f) => `(${(f / 1000).toFixed(1)} GHz)`,
                                )}
                              />
                              <image
                                iconName="object-select-symbolic"
                                visible={createBinding(
                                  wifi,
                                  "activeAccessPoint",
                                )((active) => active === ap)}
                              />

                              <image
                                visible={createBinding(ap, "requires_password")}
                                iconName="network-wireless-encrypted-symbolic"
                              ></image>
                            </box>

                            {/* Edit button */}
                            <box
                              halign={Gtk.Align.END}
                              visible
                              cssClasses={editHovered.as((h) =>
                                h ? ["inner-btn", "hovered"] : ["inner-btn"],
                              )}
                              cursor={Gdk.Cursor.new_from_name("pointer", null)}
                              onRealize={(self) => {
                                const motion = new Gtk.EventControllerMotion()
                                motion.connect("enter", () =>
                                  setEditHovered(true),
                                )
                                motion.connect("leave", () =>
                                  setEditHovered(false),
                                )
                                self.add_controller(motion)

                                const gesture = new Gtk.GestureClick()
                                gesture.set_propagation_phase(
                                  Gtk.PropagationPhase.CAPTURE,
                                )
                                gesture.connect("pressed", () => {
                                  gesture.set_state(
                                    Gtk.EventSequenceState.CLAIMED,
                                  )
                                  openNcgui(ap)
                                })
                                self.add_controller(gesture)
                              }}
                            >
                              <image
                                iconName={"pencil-edit-icon-symbolic"}
                                valign={Gtk.Align.CENTER}
                                halign={Gtk.Align.CENTER}
                              />
                            </box>
                          </box>
                        </button>
                      )
                    }}
                  </For>
                </box>
              </popover>
            </menubutton>
          )
        }
      </With>
    </box>
  )
}
