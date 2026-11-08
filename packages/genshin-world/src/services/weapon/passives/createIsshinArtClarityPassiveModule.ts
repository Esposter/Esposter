import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

// Isshin Art Clarity at its rank: a normal, charged or plunging attack its wielder lands on an opponent whips up a Hewing Gale,
// Which deals an extra hit at the rank's multiplier of ATK and raises the wielder's ATK by the rank's percentage for the
// Rank's seconds, once every rank's cooldown in seconds. The Gale's area is not named by the text, so it is the small AoE,
// Provisionally, and its hit names no element, as Falcon's Defiance's does not
export const createIsshinArtClarityPassiveModule = (params: number[]): PassiveModule => {
  const talentMultiplier = takeOne(params, 0);
  const attackPercent = takeOne(params, 1);
  const attackSeconds = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag === undefined ||
        ![AttackTag.NormalAttack, AttackTag.ChargedAttack, AttackTag.PlungingAttack].includes(event.attackTag)
      )
        return;
      if (
        !queueCooldownHit(context, combatant, "isshinArtClarityCooldown", cooldownSeconds, {
          hitArea: SMALL_AOE_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier,
        })
      )
        return;
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: attackPercent,
        attribute: Attribute.AttackPercent,
        secondsRemaining: attackSeconds,
        source: "isshinArtClarity",
      });
    },
  };
};
