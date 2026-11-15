export const CharacterId = { Npc: "Npc", Player: "Player" } as const;
export type CharacterId = (typeof CharacterId)[keyof typeof CharacterId];
