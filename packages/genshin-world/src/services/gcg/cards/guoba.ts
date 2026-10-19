import { Element } from "#src/models/Element";
import { createGcgEndPhaseDamageSummon } from "#src/services/gcg/effects/createGcgEndPhaseDamageSummon";

const GUOBA_DAMAGE = 2;

// Guoba, which Guoba Attack summons: at the end phase, 2 Pyro DMG, for two usages
export const guoba = createGcgEndPhaseDamageSummon({ damage: GUOBA_DAMAGE, damageType: Element.Pyro, usages: 2 });
