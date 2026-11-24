import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkHasKitField } from "#src/services/kit/effects/checkHasKitField";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

const MASTERY_CLOCK_ID = "masteryClock";

// A passive that, on each tick of a clock it keeps from the start of the battle, gives its wielder a buff of the rank's
// Share of its Elemental Mastery, buffed as it stands at the tick, for the rank's seconds, whether or not the wielder
// Is on the field. Each other member of the deployed team gets the rank's share of that buff. The buffs are sourced by
// Their wielder, so two wielders' buffs on one member stack, and a wielder's own buff restarts on each tick rather
// Than stacking. The attribute and scale say what the rank's rate is in, as the Elemental Mastery's rate is a
// Percentage in one weapon's rows and a fraction in another's
export const createMasteryClockPassiveModule = (
  params: number[],
  { attribute, valueScale }: { attribute: Attribute; valueScale: number },
): PassiveModule => {
  const intervalSeconds = takeOne(params, 0);
  const rate = takeOne(params, 1) * valueScale;
  const seconds = takeOne(params, 2);
  const nearbyShare = takeOne(params, 3);
  return {
    onStep: ({ kitEffectState }, { characterId }) => {
      // The clock is cast once, so a step that finds it standing casts nothing, as a field restarts by its id
      if (checkHasKitField(kitEffectState.effects, characterId, MASTERY_CLOCK_ID)) return;
      castKitField(
        kitEffectState,
        characterId,
        { x: 0, z: 0 },
        {
          id: MASTERY_CLOCK_ID,
          nextTickSeconds: intervalSeconds,
          onTick: ({ characterIdCombatantMap, kitEffectState: tickKitEffectState, party }) => {
            const wielder = characterIdCombatantMap.get(characterId);
            if (!wielder) return;
            const { attributeTotalMap } = getBuffedCombatant(
              wielder,
              tickKitEffectState.effects,
              party,
              characterIdCombatantMap,
            ).attributes;
            const amount = attributeTotalMap[Attribute.ElementalMastery] * rate;
            const source = `${MASTERY_CLOCK_ID}${ID_SEPARATOR}${characterId}`;
            buffKitMember(tickKitEffectState, characterId, { amount, attribute, secondsRemaining: seconds, source });
            for (const memberId of getDeployedCharacterIds(party))
              if (memberId !== characterId)
                buffKitMember(tickKitEffectState, memberId, {
                  amount: amount * nearbyShare,
                  attribute,
                  secondsRemaining: seconds,
                  source,
                });
          },
          secondsRemaining: Number.POSITIVE_INFINITY,
          tickIntervalSeconds: intervalSeconds,
        },
      );
    },
  };
};
