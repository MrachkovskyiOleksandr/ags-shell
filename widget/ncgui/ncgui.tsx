import app from "ags/gtk4/app"

import AstalNetwork from "gi://AstalNetwork"

import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

const [visible, setVisible] = createState(false)
const [currentAp, setCurrentAp] = createState<AstalNetwork.AccessPoint | null>(
  null,
)
const [password, setPassword] = createState("")
const [showPassword, setShow] = createState(false)

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
      <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        <label
          cssClasses={["header"]}
          label={currentAp.as((ap) => ap?.ssid ?? "")}
        />
        <box cssClasses={["password-box"]} spacing={6} orientation={Gtk.Orientation.HORIZONTAL}>
          <label halign={Gtk.Align.START} label={"Password"}></label>
          <entry
            halign={Gtk.Align.START}
            hexpand
            text={password}
            visibility={showPassword}
            onNotifyText={({ text }) => setPassword(text)}
            onActivate={() => connectNcgui()}
          />
          <togglebutton
            active={showPassword}
            onToggled={() => setShow((v) => !v)}
            halign={Gtk.Align.END}
            valign={Gtk.Align.CENTER}
          >
            <label label={""}></label>
          </togglebutton>
        </box>
        <box spacing={6} orientation={Gtk.Orientation.HORIZONTAL}>
          <button onClicked={closeNcgui} halign={Gtk.Align.END} hexpand>
            <label label="Cancel" />
          </button>
          <button halign={Gtk.Align.END} onClicked={connectNcgui}>
            <label label="Connect" />
          </button>
        </box>
      </box>
    </window>
  )
}
