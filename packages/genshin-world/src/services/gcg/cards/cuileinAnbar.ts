import { Element } from "#src/models/Element";
import { createGcgEndPhaseDamageSummon } from "#src/services/gcg/effects/createGcgEndPhaseDamageSummon";

const CUILEIN_ANBAR_DAMAGE = 2;

// Cuilein-Anbar, the summon Trump-Card Kitty creates: at the end phase, 2 Dendro DMG, for two usages (the wiki's
// Cuilein-Anbar)
export const cuileinAnbar = createGcgEndPhaseDamageSummon({
  damage: CUILEIN_ANBAR_DAMAGE,
  damageType: Element.Dendro,
  usages: 2,
});
