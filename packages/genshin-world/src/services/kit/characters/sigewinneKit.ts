import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

export const SIGEWINNE_CHARACTER_ID = 10_000_095;

// Sigewinne's behaviour: the press casts Bolstering Bubblebalm where she stands, its bubble's bounces landing from there,
// Each a share of her Max HP as the striker's is when it is priced. Its healing, its hold's bubble tiers and the
// Fully-Charged Aimed Shot's second level, the Mini-Stration Bubble, are not built
// Constellation 1 needs three extra bounces of Bolstering Bubblebalm and the shrink rule, which the kit does not build
// Constellation 2 needs the Bubbly Shield from Rebound Hydrotherapy and Super Saturated Syringing, not built
// Constellation 4 needs Super Saturated Syringing, the burst, which the kit does not build
// Constellation 6 needs Super Saturated Syringing's CRIT Rate and CRIT DMG from her Max HP, not built
export const createSigewinneKitBehaviour = ({ readHits }: KitRecordReader): KitBehaviour => {
  const bolsteringBubblebalmHits = readHits("bolsteringBubblebalmBounces");
  return {
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, bolsteringBubblebalmHits);
      },
    },
  };
};
