export const NpcPathObjectProperty = {
  Index: "index",
} as const;
export type NpcPathObjectProperty = (typeof NpcPathObjectProperty)[keyof typeof NpcPathObjectProperty];
