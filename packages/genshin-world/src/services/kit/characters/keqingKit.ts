import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";

// The Electro infusion the Lightning Stiletto's recast gives lasts 6 seconds from the recast, which the Mac measures from
// The game's text since gcsim gives its seconds outside the file fetched
const ELECTRO_INFUSION_SECONDS = 6;
// Measured: gcsim v2.47.2 (MIT) keqing/asc.go, A4: Starward Sword gives Keqing 15% CRIT Rate and 15% Energy Recharge for
// 8 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/asc.go
const STARWARD_SWORD_ASCENSION = 4;
const STARWARD_SWORD_CRITICAL_RATE = 0.15;
const STARWARD_SWORD_ENERGY_RECHARGE = 0.15;
const STARWARD_SWORD_SECONDS = 8;

export const KEQING_CHARACTER_ID = 10_000_042;

// Keqing's behaviour: the Lightning Stiletto's recast, a second press of Stellar Restoration within its window, infuses
// Her attacks with Electro for the infusion's seconds as it starts. From Ascension 4 Starward Sword gives her CRIT Rate and
// Energy Recharge. Her other passives and constellations are not built, as no kit event reaches a value the fetched
// Sources give
// Constellation 1 needs an ATK-scaled Electro hit on each Lightning Stiletto recast, which no hit carries
// Constellation 2 needs an Elemental Particle chance on each hit against Electro, which no hit drops yet
// Constellation 4 needs the Electro-related reactions Keqing triggers, which the reaction types do not name
// Constellation 6 needs the 6% Electro DMG stacking on each initiated action, which the kit does not build
export const createKeqingKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      if (combatant.ascension < STARWARD_SWORD_ASCENSION) return;
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: STARWARD_SWORD_CRITICAL_RATE,
        attribute: Attribute.CriticalRate,
        secondsRemaining: STARWARD_SWORD_SECONDS,
        source: "keqing-starward-sword-critical-rate",
      });
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: STARWARD_SWORD_ENERGY_RECHARGE,
        attribute: Attribute.EnergyRecharge,
        secondsRemaining: STARWARD_SWORD_SECONDS,
        source: "keqing-starward-sword-energy-recharge",
      });
    },
  },
  skillChain: [
    {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Electro,
          kind: "infusion",
          secondsRemaining: ELECTRO_INFUSION_SECONDS,
        }),
    },
  ],
});
