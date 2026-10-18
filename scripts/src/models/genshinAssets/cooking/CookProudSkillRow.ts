// The fields read off one row of the game's proud skill table that a cooking talent is: its proud skill group, the effect
// It names as the table spells it, and the parameters that effect is written with, as the table gives them
export interface CookProudSkillRow {
  lifeEffectParams: string[];
  lifeEffectType?: string;
  proudSkillGroupId: number;
}
