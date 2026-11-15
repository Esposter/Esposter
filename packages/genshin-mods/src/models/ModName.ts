export const ModName = {
  Commission: "commission",
  Pulse: "pulse",
  Resin: "resin",
  Sins: "sins",
  Veil: "veil",
  Ward: "ward",
  Waypoints: "waypoints",
} as const;
export type ModName = (typeof ModName)[keyof typeof ModName];
