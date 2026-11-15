export const TeleportTargetObjectProperty = {
  Id: "id",
  TilemapKey: "tilemapKey",
} as const;
export type TeleportTargetObjectProperty = (typeof TeleportTargetObjectProperty)[keyof typeof TeleportTargetObjectProperty];
