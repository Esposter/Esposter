import { Element } from "#src/models/Element";
import { createGcgEndPhaseDamageSummon } from "#src/services/gcg/effects/createGcgEndPhaseDamageSummon";

// Oceanic Mimic: Raptor, a summon for three usages that deals 1 Hydro DMG at the end phase (the wiki's Oceanid Mimic Summoning)
const RAPTOR_DAMAGE = 1;

export const oceanicMimicRaptor = createGcgEndPhaseDamageSummon({
  damage: RAPTOR_DAMAGE,
  damageType: Element.Hydro,
  usages: 3,
});
