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

export const forgetNcgui = async () => {
  try {
    await execAsync(`nmcli connection delete "${currentAp()?.ssid}"`)
    closeNcgui()
  } catch (error) {
    console.error(error)
  }
}

export const disconnectNcgui = async () => {
  try {
    await execAsync(`nmcli connection down "${currentAp()?.ssid}"`)
    closeNcgui()
  } catch (error) {
    console.error(error)
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
          spacing={15}
        >
          <button
            onClicked={closeNcgui}
            cursor={Gdk.Cursor.new_from_name("pointer", null)}
          >
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
            onClicked={connectNcgui}
            cursor={Gdk.Cursor.new_from_name("pointer", null)}
          >
            <label label="Connect" />
          </button>
        </box>

        <box
          cssClasses={["password-box"]}
          spacing={6}
          orientation={Gtk.Orientation.HORIZONTAL}
          halign={Gtk.Align.START}
        >
          <label label={"Password"} />
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
          <button
            cssClasses={["forget"]}
            halign={Gtk.Align.START}
            hexpand
            onClicked={forgetNcgui}
            cursor={Gdk.Cursor.new_from_name("pointer", null)}
          >
            <label label={"Forget network"} />
          </button>
          <label
            cssClasses={["connecting"]}
            halign={Gtk.Align.CENTER}
            hexpand
            visible={isConnecting}          
            label={""}
          />
          <button
            cssClasses={["disconnect"]}
            halign={Gtk.Align.END}
            onClicked={disconnectNcgui}
            cursor={Gdk.Cursor.new_from_name("pointer", null)}
          >
            <label label={"Disconnect"} />
          </button>
        </box>
      </box>
    </window>
  )
}
