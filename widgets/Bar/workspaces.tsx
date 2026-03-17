import { createBinding, For } from "ags"
import AstalHyprland from "gi://AstalHyprland"
import { pointer } from "../../utils/format"
import { sortedWorkspaces } from "../../utils/workspaces"

export default function Workspaces() {
    const hypr = AstalHyprland.get_default()

    return (
        <box spacing={4}>
            <For each={sortedWorkspaces}>
                {(ws: AstalHyprland.Workspace) => (
                    <button
                        cursor={pointer}
                        cssClasses={createBinding(hypr, "focusedWorkspace").as((focused) =>
                            focused?.id === ws.id ? ["workspace", "active"] : ["workspace"]
                        )}
                        onClicked={() => hypr.dispatch("workspace", `${ws.id}`)}
                    >
                        <label label={`${ws.id}`} />
                    </button>
                )}
            </For>
        </box>
    )
}