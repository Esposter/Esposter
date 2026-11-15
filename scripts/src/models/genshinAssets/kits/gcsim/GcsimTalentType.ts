// The combat talents a gcsim character config names a multiplier from, each read from its own proud skill group
export const GcsimTalentType = { Attack: "attack", Burst: "burst", Skill: "skill" } as const;
export type GcsimTalentType = (typeof GcsimTalentType)[keyof typeof GcsimTalentType];
