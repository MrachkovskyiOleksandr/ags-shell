import { createBinding, createState } from "ags"
import AstalHyprland from "gi://AstalHyprland?version=0.1"

const hypr = AstalHyprland.get_default()

hypr.connect("notify::focused-workspace", () => {
  const focusedId = hypr.focusedWorkspace?.id
  setWsState((s) => ({
    focused: focusedId,
    urgent: s.urgent.filter((id) => id !== focusedId),
  }))
})

hypr.connect("urgent", (_, client) => {
  const clientWsId = client.workspace.id
  if (clientWsId === hypr.focusedWorkspace?.id) return
  setWsState((s) => ({ ...s, urgent: [...s.urgent, clientWsId] }))
})

export const [wsState, setWsState] = createState({
  focused: hypr.focusedWorkspace?.id,
  urgent: [] as number[],
})

export const sortedWorkspaces = createBinding(hypr, "workspaces").as((wss) =>
  wss.filter((ws) => ws.id > 0).sort((a, b) => a.id - b.id),
)
