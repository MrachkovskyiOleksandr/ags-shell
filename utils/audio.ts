import { createBinding } from "ags"
import AstalWp from "gi://AstalWp?version=0.1"

export const wp = AstalWp.get_default()?.audio
export const device = wp.default_speaker

export const audioIcon = createBinding(device, "volumeIcon")
