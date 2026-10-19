import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { getGleamingMoonLunarBonus } from "#src/services/artifact/sets/getGleamingMoonLunarBonus";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { getMoonsignLevelAmount } from "#src/services/party/getMoonsignLevelAmount";
import { takeOne } from "@esposter/shared";

const GLEAMING_MOON_DEVOTION_ID = "gleamingMoonDevotion";
const SILKEN_MOON_SERENADE_SOURCE = "Silken Moon's Serenade";

// Silken Moon's Serenade's four-piece. An Elemental DMG hit its wearer deals, off the field as on it, gives the Gleaming Moon:
// Devotion effect for the first param's seconds, which raises every party member's Elemental Mastery by the second param at Nascent
// Gleam and the third at Ascendant Gleam, none with no Moonsign, and raises every party member's Lunar Reaction DMG by the fourth param
// While it holds. The effect is gained with no Moonsign, as the text says, where gcsim's Init returns before it at Moonsign level zero
export const createSilkenMoonsSerenadeSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  const nascentElementalMasteryBonus = takeOne(bonus.params, 1);
  const ascendantElementalMasteryBonus = takeOne(bonus.params, 2);
  const lunarDamageBonus = takeOne(bonus.params, 3);
  const moonsignLevelElementalMasteryBonusMap: Record<MoonsignLevel, number> = {
    [MoonsignLevel.AscendantGleam]: ascendantElementalMasteryBonus,
    [MoonsignLevel.NascentGleam]: nascentElementalMasteryBonus,
  };
  return {
    getPartyReactionBonus: (member, reaction, context) =>
      getGleamingMoonLunarBonus(member, reaction, GLEAMING_MOON_DEVOTION_ID, lunarDamageBonus, context),
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      if (event.kind !== KitEventKind.EnemyHit) return;
      if (event.striker.characterId !== combatant.characterId || event.element === undefined) return;
      addKitStatus(kitEffectState, combatant.characterId, { id: GLEAMING_MOON_DEVOTION_ID, secondsRemaining: seconds });
      const amount = getMoonsignLevelAmount(characterIdCombatantMap, party, moonsignLevelElementalMasteryBonusMap);
      if (amount === 0) return;
      buffKitTeam(kitEffectState, party, {
        amount,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: seconds,
        source: SILKEN_MOON_SERENADE_SOURCE,
      });
    },
  };
};
