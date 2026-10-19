import { Element } from "#src/models/Element";
import { createGcgEndPhaseDamageSummon } from "#src/services/gcg/effects/createGcgEndPhaseDamageSummon";

const FROSTFLAKE_SEKI_NO_TO_DAMAGE = 2;

// Frostflake Seki no To, the summon Kamisato Art: Soumetsu creates: at each End Phase, 2 Cryo DMG, for two usages (the
// Wiki's Frostflake Seki no To)
export const frostflakeSekiNoTo = createGcgEndPhaseDamageSummon({
  damage: FROSTFLAKE_SEKI_NO_TO_DAMAGE,
  damageType: Element.Cryo,
  usages: 2,
});
