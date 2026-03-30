import app from "ags/gtk4/app"

import AstalNetwork from "gi://AstalNetwork"

import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createBinding } from "ags"

import { pointer } from "../../utils/format"
import {
  closeNcgui,
  connect,
  currentAp,
  disconnectNcgui,
  forgetNcgui,
  password,
  setPassword,
  setShow,
  showPassword,
  visible,
} from "../../utils/network"

const network = AstalNetwork.get_default()
const wifi = network.wifi

export default function ncgui() {
  const isConnecting = createBinding(wifi, "state").as(
    (s) =>
      (s === AstalNetwork.DeviceState.PREPARE ||
        s === AstalNetwork.DeviceState.CONFIG ||
        s === AstalNetwork.DeviceState.NEED_AUTH ||
        s === AstalNetwork.DeviceState.IP_CONFIG ||
        s === AstalNetwork.DeviceState.IP_CHECK) &&
      wifi.activeAccessPoint === currentAp(),
  )

  return (
    <window
      visible={visible}
      cssClasses={["ncgui-window"]}
      application={app}
      layer={Astal.Layer.TOP}
      anchor={Astal.WindowAnchor.NONE}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.ON_DEMAND}
      onRealize={(self) => {
        const key = new Gtk.EventControllerKey()
        key.connect("key-pressed", (_, keyval) => {
          if (keyval === Gdk.KEY_Escape) closeNcgui()
        })
        self.add_controller(key)
      }}
    >
      <box orientation={Gtk.Orientation.VERTICAL} hexpand>
        <box
          cssClasses={["header"]}
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={15}
        >
          <button onClicked={closeNcgui} cursor={pointer}>
            <label label="Cancel" />
          </button>
          <box
            hexpand
            orientation={Gtk.Orientation.VERTICAL}
            halign={Gtk.Align.CENTER}
          >
            <label label={currentAp.as((ap) => ap?.ssid ?? "")} />
            <label
              cssClasses={["frequency-label"]}
              label={currentAp.as(
                (ap) => `(${((ap?.frequency ?? 0) / 1000).toFixed(1)} GHz)`,
              )}
            />
          </box>
          <button
            onClicked={() => currentAp() && connect(currentAp()!, password())}
            cursor={pointer}
          >
            <label label="Connect" />
          </button>
        </box>

        <box
          cssClasses={["password-box"]}
          orientation={Gtk.Orientation.HORIZONTAL}
          hexpand
        >
          <label label={"Password"} />
          <entry
            hexpand
            text={password}
            visibility={showPassword}
            onNotifyText={({ text }) => setPassword(text)}
            onActivate={() => currentAp() && connect(currentAp()!, password())}
          />
          <togglebutton
            active={showPassword}
            onToggled={() => setShow((v) => !v)}
            valign={Gtk.Align.CENTER}
          >
            <image
              iconName={showPassword.as((p) =>
                p ? "view-reveal-symbolic" : "view-conceal-symbolic",
              )}
              cursor={pointer}
            />
          </togglebutton>
        </box>

        <box cssClasses={["bottom-buttons-box"]} spacing={6} orientation={Gtk.Orientation.HORIZONTAL}>
          <button
            cssClasses={["forget"]}
            halign={Gtk.Align.START}
            hexpand
            visible={password.as((p) => p.length > 0)}
            onClicked={forgetNcgui}
            cursor={pointer}
          >
            <label label={"Forget network"} />
          </button>
          <box
            visible={isConnecting}
            halign={Gtk.Align.CENTER}
            hexpand
            spacing={4}
          >
            <label cssClasses={["dot", "dot-1"]} label="•" />
            <label cssClasses={["dot", "dot-2"]} label="•" />
            <label cssClasses={["dot", "dot-3"]} label="•" />
          </box>
          <button
            cssClasses={["disconnect"]}
            halign={Gtk.Align.END}
            visible={currentAp.as(
              (ap) => wifi.activeAccessPoint?.bssid === ap?.bssid,
            )}
            onClicked={disconnectNcgui}
            cursor={pointer}
          >
            <label label="Disconnect" />
          </button>
        </box>
      </box>
    </window>
  )
}
