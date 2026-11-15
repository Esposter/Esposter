// The zone an action turns its body to a target within as it starts: a strike's, which a normal attack, a charged
// Attack and a plunge take, or a skill's, which a skill and a burst take
export const KitTargeting = { Skill: "Skill", Strike: "Strike" } as const;
export type KitTargeting = (typeof KitTargeting)[keyof typeof KitTargeting];
