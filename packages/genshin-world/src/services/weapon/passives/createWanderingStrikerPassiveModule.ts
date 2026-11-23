import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const WANDERING_STRIKER_COOLDOWN_ID = "wanderingStrikerCooldown";

const checkIsWanderingStrikerAttack = (attackTag: AttackTag | undefined): boolean =>
  checkIsNormalOrChargedAttack(attackTag) || attackTag === AttackTag.PlungingAttack;

// Wandering Striker at its rank: a Normal, Charged or Plunging Attack hit its wielder lands releases an Accursed
// Spirit, a small AoE at the rank's multiplier of ATK on the enemy it struck, once every the rank's cooldown in
// Seconds. The variant with a heal Restores the wielder the rank's share of its ATK as HP with each spirit released,
// And the wielder's own DMG is decreased by The rank's last amount
export const createWanderingStrikerPassiveModule = (params: number[], { heals }: { heals: boolean }): PassiveModule => {
  const talentMultiplier = takeOne(params, 0);
  const healShare = heals ? takeOne(params, 1) : 0;
  const offset = heals ? 2 : 1;
  const cooldownSeconds = takeOne(params, offset);
  const damageBonus = takeOne(params, offset + 1);
  return {
    getStrikeDamageBonus: () => damageBonus,
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsWanderingStrikerAttack(event.attackTag)
      )
        return;
      if (
        !queueCooldownHit(
          context,
          combatant,
          WANDERING_STRIKER_COOLDOWN_ID,
          cooldownSeconds,
          { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier },
          event.enemy,
        ) ||
        !heals
      )
        return;
      const { attributes } = getBuffedCombatant(
        combatant,
        context.kitEffectState.effects,
        context.party,
        context.characterIdCombatantMap,
      );
      changeKitMemberHealth(context, combatant, combatant.characterId, healShare * attributes.attack);
    },
  };
};
