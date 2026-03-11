import app from "ags/gtk4/app"

import AstalNetwork from "gi://AstalNetwork"

import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createBinding, createState } from "ags"
import { execAsync } from "ags/process"

const [visible, setVisible] = createState(false)
const [currentAp, setCurrentAp] = createState<AstalNetwork.AccessPoint | null>(
  null,
)
const [password, setPassword] = createState("")
const [showPassword, setShow] = createState(false)

const network = AstalNetwork.get_default()
const wifi = network.wifi

export const openNcgui = async (ap: AstalNetwork.AccessPoint) => {
  setCurrentAp(ap)
  try {
    const saved = await execAsync(
      `nmcli -s -g 802-11-wireless-security.psk connection show "${ap.ssid}"`,
    )
    setPassword(saved.trim())
  } catch {
    setPassword("")
  }
  setVisible(true)
}

export const connectNcgui = async () => {
  let attempts = 0
  while (attempts < 10) {
    try {
      await execAsync(
        `nmcli d wifi connect "${currentAp()?.ssid}" password "${password()}"`,
      )
      closeNcgui()
      return
    } catch {
      attempts++
    }
  }
}

export const closeNcgui = () => {
  setVisible(false)
  setCurrentAp(null)
  setPassword("")
}

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
      cssClasses={["main-window"]}
      application={app}
      layer={Astal.Layer.TOP}
      anchor={Astal.WindowAnchor.NONE}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.EXCLUSIVE}
      onRealize={(self) => {
        const key = new Gtk.EventControllerKey()
        key.connect("key-pressed", (_, keyval) => {
          if (keyval === Gdk.KEY_Escape) closeNcgui()
        })
        self.add_controller(key)
      }}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={8} hexpand>
        <box
          cssClasses={["header"]}
          orientation={Gtk.Orientation.HORIZONTAL}
          halign={Gtk.Align.CENTER}
          spacing={15}
        >
          <label label={currentAp.as((ap) => ap?.ssid ?? "")} />
          <label
            cssClasses={["frequency-label"]}
            label={currentAp.as(
              (ap) => `(${((ap?.frequency ?? 0) / 1000).toFixed(1)} GHz)`,
            )}
          />
        </box>
        <box
          cssClasses={["password-box"]}
          spacing={6}
          orientation={Gtk.Orientation.HORIZONTAL}
          halign={Gtk.Align.START}
        >
          <label label={"Password"}></label>
          <entry
            hexpand
            text={password}
            visibility={showPassword}
            onNotifyText={({ text }) => setPassword(text)}
            onActivate={() => connectNcgui()}
          />
          <togglebutton
            active={showPassword}
            onToggled={() => setShow((v) => !v)}
            valign={Gtk.Align.CENTER}
          >
            <image
              iconName={"eye-icon-symbolic"}
              cursor={Gdk.Cursor.new_from_name("pointer", null)}
            />
          </togglebutton>
        </box>
        <box spacing={6} orientation={Gtk.Orientation.HORIZONTAL}>
          <label
            label={"Connecting..."}
            visible={isConnecting}
            cssClasses={["connecting"]}
          ></label>
          <button
            onClicked={closeNcgui}
            halign={Gtk.Align.END}
            hexpand
            cursor={Gdk.Cursor.new_from_name("pointer", null)}
          >
            <label label="Cancel" />
          </button>
          <button
            halign={Gtk.Align.END}
            onClicked={connectNcgui}
            cursor={Gdk.Cursor.new_from_name("pointer", null)}
          >
            <label label="Connect" />
          </button>
        </box>
      </box>
    </window>
  )
}
