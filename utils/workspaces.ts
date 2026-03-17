import { createBinding } from "ags"
import AstalHyprland from "gi://AstalHyprland?version=0.1"

const hypr = AstalHyprland.get_default()

export const sortedWorkspaces = createBinding(hypr, "workspaces").as((wss) =>
  wss.filter((ws) => ws.id > 0).sort((a, b) => a.id - b.id),
)
