import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

// The Electro infusion the Lightning Stiletto's recast gives lasts 6 seconds from the recast, which the Mac measures from
// The game's text since gcsim gives its seconds outside the file fetched
const ELECTRO_INFUSION_SECONDS = 6;

export const KEQING_CHARACTER_ID = 10_000_042;

// Keqing's behaviour: the Lightning Stiletto's recast, a second press of Stellar Restoration within its window, infuses
// Her attacks with Electro for the infusion's seconds as it starts. Her passives and constellations are not built, as no
// Kit event reaches a value the fetched sources give
export const createKeqingKitBehaviour = (): KitBehaviour => ({
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
