import GTop from "gi://GTop"
import AstalNetwork from "gi://AstalNetwork"

import { createPoll } from "ags/time"
import { Gdk } from "ags/gtk4"

export const pointer = Gdk.Cursor.new_from_name("pointer", null)

const getIface = () => {
  const ifaces = GTop.glibtop_get_netlist(new GTop.glibtop_netlist())
  return ifaces.find((i: string) => i !== "lo") ?? "wlan0"
}

const IFACE = getIface()
const netLoad = new GTop.glibtop_netload()
let prevRx = 0
let prevTx = 0

export const formatSpeed = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B/s`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB/s`
}

export const networkSpeed = createPoll(
  { down: "0 B/s", up: "0 B/s" },
  1000,
  () => {
    GTop.glibtop_get_netload(netLoad, IFACE)
    const down = formatSpeed(netLoad.bytes_in - prevRx)
    const up = formatSpeed(netLoad.bytes_out - prevTx)
    prevRx = netLoad.bytes_in
    prevTx = netLoad.bytes_out
    return { down, up }
  },
)

export const sortedAP = (arr: Array<AstalNetwork.AccessPoint>) => {
  return arr.filter((ap) => !!ap.ssid).sort((a, b) => b.strength - a.strength)
}
