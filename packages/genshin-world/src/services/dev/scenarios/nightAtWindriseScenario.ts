import type { DevScenario } from "#src/models/dev/DevScenario";

// Lands at the Windrise statue's arrival position, facing the yaw a coordinate teleport gives, not the statue's turn
// It also sets the clock to midnight
export const nightAtWindriseScenario: DevScenario = {
  lines: ["teleport 44.38 0.79 -0.51", "time 00:00"],
  name: "night-at-windrise",
};
