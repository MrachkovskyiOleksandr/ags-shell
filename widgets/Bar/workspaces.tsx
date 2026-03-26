import { For } from "ags"
import AstalHyprland from "gi://AstalHyprland"
import { pointer } from "../../utils/format"
import { setWsState, sortedWorkspaces, wsState } from "../../utils/workspaces"

export default function Workspaces() {
  const hypr = AstalHyprland.get_default()

  return (
    <box spacing={4} cssClasses={["workspaces-box"]} >
      <For each={sortedWorkspaces}>
        {(ws: AstalHyprland.Workspace) => (
          <button
            cursor={pointer}
            cssClasses={wsState.as(({ focused, urgent }) => {
              if (focused === ws.id) return ["workspace", "active"]
              if (urgent.includes(ws.id)) return ["workspace", "urgent"]
              return ["workspace"]
            })}
            onClicked={() => {
              hypr.dispatch("workspace", `${ws.id}`)
              setWsState((s) => ({
                ...s,
                urgent: s.urgent.filter((id) => id !== ws.id),
              }))
            }}
          >
            <label label={`${ws.id}`} />
          </button>
        )}
      </For>
    </box>
  )
}
