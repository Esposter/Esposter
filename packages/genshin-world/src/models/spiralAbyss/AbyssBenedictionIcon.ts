// The glyph a Benediction's card draws in its diamond
export const AbyssBenedictionIcon = { Shield: "shield", Sword: "sword" } as const;
export type AbyssBenedictionIcon = (typeof AbyssBenedictionIcon)[keyof typeof AbyssBenedictionIcon];
