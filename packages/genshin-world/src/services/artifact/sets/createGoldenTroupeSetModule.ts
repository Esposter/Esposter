import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const GOLDEN_TROUPE_LINGER_STATUS_ID = "goldenTroupeLinger";

// Golden Troupe. Its two-piece bonus raises the Elemental Skill DMG of its wearer by the table's first param. Its four-piece
// Bonus raises it by the same again while its wearer is off the field, and for the third param's seconds after it takes the
// Field, as the game's bonus is cleared that long after. The second param is left unread
export const createGoldenTroupeSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const damageBonus = takeOne(bonus.params, 0);
  if (bonus.pieceCount === 2)
    return { getStrikeDamageBonus: (strike) => (strike.attackTag === AttackTag.ElementalSkill ? damageBonus : 0) };
  const seconds = takeOne(bonus.params, 2);
  return {
    getStrikeDamageBonus: (strike, _enemy, party, effects) => {
      if (strike.attackTag !== AttackTag.ElementalSkill) return 0;
      const { characterId } = strike.combatant;
      const isOffField = getActiveCharacterId(party) !== characterId;
      const isLingering = checkIsKitStatusActive(effects, characterId, GOLDEN_TROUPE_LINGER_STATUS_ID);
      return damageBonus + (isOffField || isLingering ? damageBonus : 0);
    },
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.characterId !== combatant.characterId) return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: GOLDEN_TROUPE_LINGER_STATUS_ID,
        secondsRemaining: seconds,
      });
    },
  };
};
