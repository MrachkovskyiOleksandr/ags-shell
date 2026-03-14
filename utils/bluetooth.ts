import { createBinding, createComputed } from "ags"
import { createPoll } from "ags/time"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"

export const bluetooth = AstalBluetooth.get_default()

export const adapter = bluetooth.adapter
export const powered = createBinding(adapter, "powered")
export const devices = createBinding(bluetooth, "devices")

export const bluetoothIcon = createPoll("bluetooth-symbolic", 1000, () => {
  if (!adapter.powered) return "bluetooth-disabled-symbolic"
  const connected = bluetooth.devices.some((d) => d.connected)
  return connected ? "bluetooth-connected-symbolic" : "bluetooth-symbolic"
})

export const sortedDevices = createComputed(() =>
  devices()
    .filter((d) => d.name !== null)
    .sort((a, b) => Number(b.connected) - Number(a.connected)),
)
