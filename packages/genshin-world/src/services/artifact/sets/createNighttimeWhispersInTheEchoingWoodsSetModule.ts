import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { checkIsNearMoondrift } from "#src/services/party/checkIsNearMoondrift";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const NIGHTTIME_WHISPERS_ID = "nighttimeWhispers";
const INCREASE_ID = "nighttimeWhispersIncrease";
const MOONDRIFT_CLOCK_ID = "nighttimeWhispersMoondriftClock";
// The seconds between the checks for a Moondrift near the wearer, each holding the increase until the next, as gcsim's
// Ticker polls
const MOONDRIFT_CHECK_INTERVAL_SECONDS = 2;

// Holds the increase on a character for at least the seconds given, as gcsim moves the frame it ends on
const holdIncrease = (kitEffectState: KitEffectState, characterId: number, seconds: number): void => {
  const secondsRemaining = findKitStatus(kitEffectState.effects, characterId, INCREASE_ID)?.secondsRemaining ?? 0;
  addKitStatus(kitEffectState, characterId, { id: INCREASE_ID, secondsRemaining: Math.max(secondsRemaining, seconds) });
};

// Nighttime Whispers in the Echoing Woods. Its two-piece ATK is a line of the table's. Its four-piece gives its
// Wearer's skill the second param of Geo DMG Bonus for the first param's seconds, raised by the third param's share
// While the wearer on the field is under the team's Crystallize shield or near a Moondrift, and for the fourth param's
// Seconds after the shield is lost or the wearer leaves the field under it. A Moondrift is checked for every two
// Seconds from the skill while its bonus lasts, and each check that finds one holds the raise until the next
export const createNighttimeWhispersInTheEchoingWoodsSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  const geoDamageBonus = takeOne(bonus.params, 1);
  const increase = takeOne(bonus.params, 2);
  const lingerSeconds = takeOne(bonus.params, 3);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) =>
      checkIsKitStatusActive(effects, characterId, NIGHTTIME_WHISPERS_ID)
        ? [
            {
              amount: geoDamageBonus * (1 + (checkIsKitStatusActive(effects, characterId, INCREASE_ID) ? increase : 0)),
              attribute: Attribute.GeoDamageBonus,
            },
          ]
        : [],
    onKitEvent: (event, { kitEffectState, party }, { characterId }) => {
      const isOnField = getActiveCharacterId(party) === characterId;
      if (event.kind === KitEventKind.SkillUsed && event.characterId === characterId) {
        addKitStatus(kitEffectState, characterId, { id: NIGHTTIME_WHISPERS_ID, secondsRemaining: seconds });
        castKitField(
          kitEffectState,
          characterId,
          { x: 0, z: 0 },
          {
            id: MOONDRIFT_CLOCK_ID,
            nextTickSeconds: 0,
            onTick: (tickContext) => {
              if (
                getActiveCharacterId(tickContext.party) === characterId &&
                tickContext.party.lunarCrystallize.moondrifts.some((moondrift) =>
                  checkIsNearMoondrift(moondrift, tickContext.body.position),
                )
              )
                holdIncrease(tickContext.kitEffectState, characterId, MOONDRIFT_CHECK_INTERVAL_SECONDS);
            },
            secondsRemaining: seconds,
            tickIntervalSeconds: MOONDRIFT_CHECK_INTERVAL_SECONDS,
          },
        );
      } else if (event.kind === KitEventKind.ShieldCast && event.shield.isCrystallize && isOnField)
        holdIncrease(kitEffectState, characterId, event.shield.secondsRemaining);
      else if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "shield" &&
        event.effect.isCrystallize &&
        isOnField
      )
        holdIncrease(kitEffectState, characterId, lingerSeconds);
      else if (event.kind === KitEventKind.CharacterSwapped) {
        const crystallizeShield = kitEffectState.effects.find(
          (effect): effect is KitShield => checkIsKitShieldLive(effect) && effect.isCrystallize === true,
        );
        if (!crystallizeShield) return;
        if (event.characterId === characterId)
          holdIncrease(kitEffectState, characterId, crystallizeShield.secondsRemaining);
        else if (event.previousCharacterId === characterId)
          addKitStatus(kitEffectState, characterId, { id: INCREASE_ID, secondsRemaining: lingerSeconds });
      }
    },
  };
};
