export const CharacterKey = {
  Character: "Character",
  Npc: "Npc",
} as const;
export type CharacterKey = keyof typeof CharacterKey;
