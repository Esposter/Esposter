export const LoginStoneFamilyMaterialRegex = {
  Bridges: "bridges",
  Door: "door",
  DoorPanel: "doorPanel",
  Towers: "towers",
  Walkway: "walkway",
} as const;
export type LoginStoneFamilyMaterialRegex =
  (typeof LoginStoneFamilyMaterialRegex)[keyof typeof LoginStoneFamilyMaterialRegex];
