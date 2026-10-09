import type { KitEffect } from "#src/models/kit/KitEffect";
import type { GroundPoint } from "genshin-engine";

// What a skill's cooldown reads as it starts: the character's ascension and id, the body's ground point and the effects
// On the team, which a field the character stands in can lower it through
export interface KitSkillCooldownState {
  ascension: number;
  body: GroundPoint;
  characterId: number;
  effects: KitEffect[];
}
