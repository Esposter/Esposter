import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsLunarReactionType } from "#src/services/combat/checkIsLunarReactionType";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { takeOne } from "@esposter/shared";

const AUBADE_ON_FIELD_ID = "aubadeOnField";

// Aubade of Morningstar and Moon's four-piece. Its wearer's own Lunar Reactions get a DMG Bonus while the wearer is off the field, and
// The second param more at Ascendant Gleam. A swap that brings the wearer on keeps the bonus for the third param's seconds, then it
// Lapses until the wearer is off the field again. A battle that opens on the wearer raises no such window, as gcsim's aubade does not.
// The bonus is the wearer's alone: gcsim reads it from the wearer's ReactBonus, which a Lunar reaction takes from the character that
// Triggers it, and the text does not say otherwise
export const createAubadeOfMorningstarAndMoonSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const damageBonus = takeOne(bonus.params, 0);
  const ascendantDamageBonus = takeOne(bonus.params, 1);
  const onFieldSeconds = takeOne(bonus.params, 2);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }, context) => {
      if (member.characterId !== combatant.characterId || !checkIsLunarReactionType(reactionType)) return {};
      const { characterIdCombatantMap, kitEffectState, party } = context;
      const { characterId } = member;
      if (
        getActiveCharacterId(party) === characterId &&
        !checkIsKitStatusActive(kitEffectState.effects, characterId, AUBADE_ON_FIELD_ID)
      )
        return {};
      const isAscendant = getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
      return { damageBonus: isAscendant ? damageBonus + ascendantDamageBonus : damageBonus };
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.CharacterSwapped ||
        event.characterId !== combatant.characterId ||
        event.previousCharacterId === undefined
      )
        return;
      addKitStatus(kitEffectState, combatant.characterId, { id: AUBADE_ON_FIELD_ID, secondsRemaining: onFieldSeconds });
    },
  };
};
