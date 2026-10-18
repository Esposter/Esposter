import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const FALCONS_DEFIANCE_COOLDOWN_ID = "falconsDefianceCooldown";

// Aquila Favonia's Falcon's Defiance at its rank: its ATK is a static line the rank carries, so the module prices nothing.
// A loss of HP naming no other character regenerates the wielder's HP by the rank's share of ATK and queues a hit at the
// Rank's multiplier of ATK on the surrounding opponents, once every rank's cooldown in seconds. The hit's element and area
// Are not named by the text, so it is physical on the small AoE, provisionally
export const createAquilaFavoniaPassiveModule = (params: number[]): WeaponPassiveModule => {
  const healShare = takeOne(params, 1);
  const talentMultiplier = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare >= 0 ||
        event.sourceCharacterId !== undefined
      )
        return;
      if (
        !queueCooldownHit(context, combatant, FALCONS_DEFIANCE_COOLDOWN_ID, cooldownSeconds, {
          hitArea: SMALL_AOE_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier,
        })
      )
        return;
      changeKitMemberHealth(context, combatant, combatant.characterId, healShare * combatant.attributes.attack);
    },
  };
};
