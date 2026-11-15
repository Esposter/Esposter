// The two icons a character's kit carries, its elemental skill and its burst, which a skill glyph entry is keyed by
export const SkillGlyphTones = { Burst: "burst", Skill: "skill" } as const;
export type SkillGlyphTones = (typeof SkillGlyphTones)[keyof typeof SkillGlyphTones];
