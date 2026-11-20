export const LoginStoneFamily = {
  Bridges: "bridges",
  Door: "door",
  DoorPanel: "doorPanel",
  Towers: "towers",
  Walkway: "walkway",
} as const;
export type LoginStoneFamily = (typeof LoginStoneFamily)[keyof typeof LoginStoneFamily];
