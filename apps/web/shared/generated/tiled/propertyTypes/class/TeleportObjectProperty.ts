export const TeleportObjectProperty = {
  Id: "id",
  Target: "target",
} as const;
export type TeleportObjectProperty = (typeof TeleportObjectProperty)[keyof typeof TeleportObjectProperty];
