export const ObjectType = {
  Chest: "Chest",
  Encounter: "Encounter",
  Npc: "Npc",
  NpcPath: "NpcPath",
  Sign: "Sign",
  Teleport: "Teleport",
  TeleportTarget: "TeleportTarget",
} as const;
export type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];
