import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

const GILDED_DREAMS_COOLDOWN_ID = "gildedDreamsCooldown";
const GILDED_DREAMS_SOURCE = "Gilded Dreams";
// The most other members either count of the buffs counts
const MAXIMUM_COUNTED_MEMBERS = 3;

// Gilded Dreams. Its four-piece bonus, for the third param's seconds after an Elemental Reaction its wearer's strike triggers, gives its
// Wearer ATK by the first param for each other member of its element, and Elemental Mastery by the second param for each
// Other member of another element, each counting up to three members. A reaction triggers it once every fourth-param seconds,
// And the wearer carries the buffs from off the field too. The set's two-piece bonus is attributes only, so it builds no module
export const createGildedDreamsSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const attackBonusPerMember = takeOne(bonus.params, 0);
  const masteryBonusPerMember = takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  const cooldownSeconds = takeOne(bonus.params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      const { characterId, element } = combatant;
      if (event.striker.characterId !== characterId) return;
      const { characterIdCombatantMap, kitEffectState, party } = context;
      if (checkIsKitStatusActive(kitEffectState.effects, characterId, GILDED_DREAMS_COOLDOWN_ID)) return;
      addKitStatus(kitEffectState, characterId, { id: GILDED_DREAMS_COOLDOWN_ID, secondsRemaining: cooldownSeconds });
      let sameElementCount = 0;
      let differentElementCount = 0;
      for (const memberId of getDeployedCharacterIds(party)) {
        const member = characterIdCombatantMap.get(memberId);
        if (memberId === characterId || !member) continue;
        if (member.element === element) sameElementCount++;
        else differentElementCount++;
      }
      if (sameElementCount > 0)
        buffKitMember(kitEffectState, characterId, {
          amount: attackBonusPerMember * Math.min(sameElementCount, MAXIMUM_COUNTED_MEMBERS),
          attribute: Attribute.AttackPercent,
          secondsRemaining: seconds,
          source: GILDED_DREAMS_SOURCE,
        });
      if (differentElementCount > 0)
        buffKitMember(kitEffectState, characterId, {
          amount: masteryBonusPerMember * Math.min(differentElementCount, MAXIMUM_COUNTED_MEMBERS),
          attribute: Attribute.ElementalMastery,
          secondsRemaining: seconds,
          source: GILDED_DREAMS_SOURCE,
        });
    },
  };
};
