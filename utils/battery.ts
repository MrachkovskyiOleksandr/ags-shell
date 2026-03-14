export const getBatteryIcon = (percent: number, charging: boolean) => {
  if (percent >= 100)
    return charging
      ? "battery-level-100-charged-symbolic"
      : "battery-level-100-symbolic"

  const level = Math.round(percent / 10) * 10
  return charging
    ? `battery-level-${level}-charging-symbolic`
    : `battery-level-${level}-symbolic`
}