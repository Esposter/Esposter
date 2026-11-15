export const CharacterKey = { Character: "Character", Npc: "Npc" } as const;
export type CharacterKey = (typeof CharacterKey)[keyof typeof CharacterKey];
