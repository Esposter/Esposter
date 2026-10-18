import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

export const NEFER_CHARACTER_ID = 10_000_122;
// The Verdant Dew a Shadow Dance holds, and the Phantasm Performances it has played, which end the state at three
export const VERDANT_DEW_STATUS_ID = "verdant-dew";
export const PHANTASM_PERFORMANCE_STATUS_ID = "phantasm-performance";
const PHANTASM_PERFORMANCES_PER_SHADOW_DANCE = 3;

// Nefer's behaviour: Senet Strategy: Dance of a Thousand Nights enters Shadow Dance for her record's seconds, with her
// Record's Verdant Dew charges, where her Charged Attack is Phantasm Performance, a stance of its own seven hits. Each
// Phantasm Performance spends a Verdant Dew as it starts, and the third ends the state. Her strikes, skill hits, plunges
// And burst's hits are her record's alone, and her frames and areas are provisional, read from Borrowed donors' gcsim
// Hitmarks and areas.
// Not built, each waiting on its own rule: the Verdant Dew a Shadow Dance gains, whose Slither base amount the wiki does
// Not give, and the Lunar-Bloom gain of her fourth passive; a Phantasm Performance with no Verdant Dew left still plays,
// As the stance has no start gate; the burst's use of charges, since the wiki's burst spends Veils of Falsehood, not
// Verdant Dew; Constellation 1's Lunar-Bloom base DMG; Constellation 2 needs the Ascension talent A Wager of Moonlight's
// Veil of Falsehood, which the kit does not build; Constellation 4 needs the Shadow Dance Charged Attack with Verdant Dew;
// And Constellation 6 needs the Shadow Dance Charged Attack and Phantasm Performance
export const createNeferKitBehaviour = ({ readParameter, readStance }: KitRecordReader): KitBehaviour => {
  const shadowDanceSeconds = readParameter("shadowDanceSeconds");
  const verdantDewCharges = readParameter("phantasmPerformanceCharges");
  const phantasmPerformance = readStance("phantasmPerformance", {
    chargedAttack: {
      onStart: ({ activeCombatant: { characterId }, kitEffectState }) => {
        if (countKitResource(kitEffectState.effects, characterId, VERDANT_DEW_STATUS_ID) > 0)
          gainKitResource(kitEffectState, characterId, VERDANT_DEW_STATUS_ID, -1, verdantDewCharges);
        const performances = gainKitResource(
          kitEffectState,
          characterId,
          PHANTASM_PERFORMANCE_STATUS_ID,
          1,
          PHANTASM_PERFORMANCES_PER_SHADOW_DANCE,
        );
        if (performances >= PHANTASM_PERFORMANCES_PER_SHADOW_DANCE)
          removeKitEffects(kitEffectState, (effect) => effect.kind === "stance" && effect.characterId === characterId);
      },
    },
  });
  const shadowDance: KitActionBehaviour = {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      const { characterId } = combatant;
      spendKitResource(kitEffectState, characterId, PHANTASM_PERFORMANCE_STATUS_ID);
      spendKitResource(kitEffectState, characterId, VERDANT_DEW_STATUS_ID);
      gainKitResource(kitEffectState, characterId, VERDANT_DEW_STATUS_ID, verdantDewCharges, verdantDewCharges);
      enterKitStance(kitEffectState, combatant, phantasmPerformance, shadowDanceSeconds);
    },
  };
  return { skill: shadowDance };
};
