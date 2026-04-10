import AstalNetwork from "gi://AstalNetwork"
import Pango from "gi://Pango?version=1.0"

import { createBinding, With, For, createMemo } from "ags"
import { Gtk } from "ags/gtk4"

import { openNcgui, handleApClick, network } from "../../utils/network"
import { networkSpeed, pointer, sortedAP } from "../../utils/format"

export default function Wireless() {
  const wifi = createBinding(network, "wifi")

  return (
    <box
      cssClasses={["network-box"]}
      visible={wifi(Boolean)}
      tooltipText={networkSpeed.as((s) => ` ${s.down}\n ${s.up}`)}
    >
      <With value={wifi}>
        {(wifi) => {
          const networkIcon = createMemo(() =>
            createBinding(network, "primary")() === AstalNetwork.Primary.WIRED
              ? "network-wired-symbolic"
              : createBinding(wifi, "iconName")(),
          )
          
          return (
            wifi && (
              <menubutton cursor={pointer}>
                <image iconName={networkIcon} />
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
                        cursor={pointer}
                        active={createBinding(network.wifi, "enabled")}
                        onNotifyActive={({ active }) => {
                          if (active != network.wifi.enabled)
                            network.wifi.set_enabled(active)
                        }}
                      />
                      <button
                        visible={createBinding(wifi, "enabled")}
                        cssClasses={["refresh-btn"]}
                        cursor={pointer}
                        onClicked={() => wifi.scan()}
                      >
                        <box spacing={6}>
                          <image
                            iconName="refresh-icon-symbolic"
                            cssClasses={createBinding(wifi, "scanning").as(
                              (s) => (s ? ["spinning"] : []),
                            )}
                          />
                          <label label="Refresh" />
                        </box>
                      </button>
                    </box>

                    <For each={createBinding(wifi, "accessPoints")(sortedAP)}>
                      {(ap: AstalNetwork.AccessPoint) => {
                        return (
                          <box
                            cssClasses={createBinding(
                              wifi,
                              "activeAccessPoint",
                            ).as((active) =>
                              active === ap
                                ? ["wifi-list-item", "active"]
                                : ["wifi-list-item"],
                            )}
                            hexpand
                          >
                            <button
                              hexpand
                              cssClasses={["wifi-connect-btn"]}
                              cursor={pointer}
                              onClicked={() => handleApClick(ap)}
                              onRealize={(self) => {
                                const gesture = new Gtk.GestureClick()
                                gesture.set_button(2)
                                gesture.connect("pressed", () => openNcgui(ap))
                                self.add_controller(gesture)
                              }}
                            >
                              <box spacing={4} hexpand>
                                <image
                                  opacity={createBinding(
                                    ap,
                                    "requires_password",
                                  ).as((l) => (l ? 1 : 0))}
                                  iconName="network-wireless-encrypted-symbolic"
                                />
                                <image
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
                                  cssClasses={["active-icon"]}
                                  visible={createBinding(
                                    wifi,
                                    "activeAccessPoint",
                                  )((active) => active === ap)}
                                />
                              </box>
                            </button>

                            <button
                              cssClasses={["edit-btn"]}
                              cursor={pointer}
                              onClicked={() => openNcgui(ap)}
                            >
                              <image
                                iconName="pencil-edit-icon-symbolic"
                                valign={Gtk.Align.CENTER}
                                halign={Gtk.Align.CENTER}
                              />
                            </button>
                          </box>
                        )
                      }}
                    </For>
                  </box>
                </popover>
              </menubutton>
            )
          )
        }}
      </With>
    </box>
  )
}
