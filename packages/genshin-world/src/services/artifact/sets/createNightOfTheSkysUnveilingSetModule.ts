import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { getGleamingMoonLunarBonus } from "#src/services/artifact/sets/getGleamingMoonLunarBonus";
import { checkIsLunarReactionType } from "#src/services/combat/checkIsLunarReactionType";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { takeOne } from "@esposter/shared";

const GLEAMING_MOON_INTENT_ID = "gleamingMoonIntent";
const NIGHT_OF_THE_SKYS_UNVEILING_SOURCE = "Night of the Sky's Unveiling";

// Night of the Sky's Unveiling's four-piece. While its wearer is the active character, a Lunar Reaction any party member triggers
// Gives the wearer the Gleaming Moon: Intent effect for the first param's seconds, whose CRIT Rate is the second param at Nascent
// Gleam and the third at Ascendant Gleam, none with no Moonsign. The effect raises every party member's Lunar Reaction DMG by the
// Fourth param while it holds, as gcsim's lunarReactHook does with its Moonsign-level CRIT Rate and its ReactBonus
export const createNightOfTheSkysUnveilingSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  const nascentCriticalRateBonus = takeOne(bonus.params, 1);
  const ascendantCriticalRateBonus = takeOne(bonus.params, 2);
  const lunarDamageBonus = takeOne(bonus.params, 3);
  return {
    getPartyReactionBonus: (member, reaction, context) =>
      getGleamingMoonLunarBonus(member, reaction, GLEAMING_MOON_INTENT_ID, lunarDamageBonus, context),
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      if (!event.reactions.some(({ reactionType }) => checkIsLunarReactionType(reactionType))) return;
      const { characterId } = combatant;
      if (getActiveCharacterId(party) !== characterId) return;
      const moonsignLevel = getMoonsignLevel(characterIdCombatantMap, party);
      const criticalRateBonus =
        moonsignLevel === MoonsignLevel.AscendantGleam
          ? ascendantCriticalRateBonus
          : moonsignLevel === MoonsignLevel.NascentGleam
            ? nascentCriticalRateBonus
            : 0;
      addKitStatus(kitEffectState, characterId, { id: GLEAMING_MOON_INTENT_ID, secondsRemaining: seconds });
      buffKitMember(kitEffectState, characterId, {
        amount: criticalRateBonus,
        attribute: Attribute.CriticalRate,
        secondsRemaining: seconds,
        source: NIGHT_OF_THE_SKYS_UNVEILING_SOURCE,
      });
    },
  };
};
