export const NpcObjectProperty = {
  Id: "id",
} as const;
export type NpcObjectProperty = (typeof NpcObjectProperty)[keyof typeof NpcObjectProperty];
