import AstalBattery from "gi://AstalBattery"
import AstalPowerProfiles from "gi://AstalPowerProfiles"

import { createBinding, createState } from "ags"
import { createPoll } from "ags/time"
import { Gtk } from "ags/gtk4"

import { getBatteryIcon } from "../../utils/battery"
import { pointer, sendNotification } from "../../utils/format"

export default function Battery() {
  const battery = AstalBattery.get_default()
  const powerProfiles = AstalPowerProfiles.get_default()

  const profileNames: Record<string, string> = {
    "power-saver": "Power saver",
    balanced: "Balanced",
    performance: "Performance",
  }

  const percent = createBinding(
    battery,
    "percentage",
  )((p) => `${Math.floor(p * 100)}%`)

  const [icon, setIcon] = createState(
    getBatteryIcon(Math.round(battery.percentage * 100), battery.charging),
  )

  battery.connect("notify::percentage", () =>
    setIcon(
      getBatteryIcon(Math.round(battery.percentage * 100), battery.charging),
    ),
  )
  battery.connect("notify::charging", () =>
    setIcon(
      getBatteryIcon(Math.round(battery.percentage * 100), battery.charging),
    ),
  )

  const tooltipText = createPoll("", 3000, () => {
    const isCharging = battery.charging
    if (!isCharging) {
      const h = Math.floor(battery.timeToEmpty / 3600)
      const m = Math.floor((battery.timeToEmpty % 3600) / 60)
      return `Empty in ${h}:${String(m).padStart(2, "0")}`
    } else {
      const h = Math.floor(battery.timeToFull / 3600)
      const m = Math.floor((battery.timeToFull % 3600) / 60)
      return `Full in ${h}:${String(m).padStart(2, "0")}`
    }
  })

  return (
    <box
      cursor={pointer}
      cssClasses={["battery-box"]}
      tooltipText={tooltipText}
    >
      <menubutton cursor={pointer}>
        <box>
          <image iconName={icon} />
          <label label={percent} />
        </box>
        <popover hasArrow={false} cssClasses={["power-profile-popover"]}>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
            <label cssClasses={["header"]} label="Power profile" />
            <box spacing={4} orientation={Gtk.Orientation.VERTICAL}>
              {powerProfiles
                .get_profiles()
                .map((profile: AstalPowerProfiles.Profile) => (
                  <button
                    cursor={pointer}
                    cssClasses={createBinding(
                      powerProfiles,
                      "activeProfile",
                    ).as((active) =>
                      active === profile.profile
                        ? ["profile-btn", "active"]
                        : ["profile-btn"],
                    )}
                    onClicked={() => {
                      powerProfiles.set_active_profile(profile.profile)
                      sendNotification(
                        profileNames[profile.profile],
                        "",
                        "power-profile-" + profile.profile + "-symbolic",
                        0,
                        { category: ["string", "system"] },
                      )
                    }}
                  >
                    <box spacing={6}>
                      <image
                        iconName={
                          "power-profile-" + profile.profile + "-symbolic"
                        }
                      />
                      <label
                        label={profileNames[profile.profile] ?? profile.profile}
                      />
                    </box>
                  </button>
                ))}
            </box>
          </box>
        </popover>
      </menubutton>
    </box>
  )
}
