import AstalNetwork from "gi://AstalNetwork"

import { execAsync } from "ags/process"
import { createState } from "ags"

export const [visible, setVisible] = createState(false)
export const [currentAp, setCurrentAp] =
  createState<AstalNetwork.AccessPoint | null>(null)
export const [password, setPassword] = createState("")
export const [showPassword, setShow] = createState(false)

export async function connect(ap: AstalNetwork.AccessPoint, pwd?: string) {
  // For old wifi routers, that can't connect from the first try 
  let attempts = 0
  while (attempts < 20) {
    try {
      const cmd = pwd
        ? `nmcli d wifi connect "${ap.ssid}" bssid "${ap.bssid}" password "${pwd}"`
        : `nmcli d wifi connect "${ap.bssid}"`
      await execAsync(cmd)
      closeNcgui()
      return
    } catch {
      attempts++
      await new Promise((r) => setTimeout(r, 250))
    }
  }
}

export async function handleApClick(ap: AstalNetwork.AccessPoint) {
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
}

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
