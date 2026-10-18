import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

const FINALE_NORMAL_ATTACK_PAUSE_ID = "finaleNormalAttackPause";
const FINALE_ELEMENTAL_BURST_PAUSE_ID = "finaleElementalBurstPause";

// Finale of the Deep Galleries. Its four-piece bonus raises the Normal Attack and Elemental Burst DMG of its wearer by the
// Table's first param each while the wearer has no Elemental Energy. A Normal Attack that deals DMG stops the burst's bonus
// For the third param's seconds, and a burst that deals DMG stops the Normal Attack's. The second param is left unread
export const createFinaleOfTheDeepGalleriesSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const damageBonus = takeOne(bonus.params, 0);
  const seconds = takeOne(bonus.params, 2);
  return {
    getStrikeDamageBonus: (strike, _enemy, party, effects) => {
      const { characterId } = strike.combatant;
      if (getPartyMember(party, characterId).energy > 0) return 0;
      if (strike.attackTag === AttackTag.NormalAttack)
        return checkIsKitStatusActive(effects, characterId, FINALE_NORMAL_ATTACK_PAUSE_ID) ? 0 : damageBonus;
      if (strike.attackTag === AttackTag.ElementalBurst)
        return checkIsKitStatusActive(effects, characterId, FINALE_ELEMENTAL_BURST_PAUSE_ID) ? 0 : damageBonus;
      return 0;
    },
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      if (event.attackTag === AttackTag.NormalAttack)
        addKitStatus(context.kitEffectState, combatant.characterId, {
          id: FINALE_ELEMENTAL_BURST_PAUSE_ID,
          secondsRemaining: seconds,
        });
      else if (event.attackTag === AttackTag.ElementalBurst)
        addKitStatus(context.kitEffectState, combatant.characterId, {
          id: FINALE_NORMAL_ATTACK_PAUSE_ID,
          secondsRemaining: seconds,
        });
    },
  };
};
