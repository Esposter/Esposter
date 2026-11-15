export const NpcId = {
  John: "John",
  Mum: "Mum",
  Smith: "Smith",
} as const;
export type NpcId = (typeof NpcId)[keyof typeof NpcId];
