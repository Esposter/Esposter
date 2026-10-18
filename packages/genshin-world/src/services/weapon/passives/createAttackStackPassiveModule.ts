import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";
import type { PassiveStack } from "#src/services/weapon/passives/addPassiveStack";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";

const ATTACK_STACK_MAXIMUM_STACKS = 4;
const ATTACK_STACK_SECONDS = 6;

// A passive that stacks on each normal or charged attack hit its wielder deals, up to four stacks for six seconds. One
// Attack striking several enemies adds one stack between them, the cooldown holding back the rest
export const createAttackStackPassiveModule = (
  passive: Pick<PassiveStack, "cooldownSeconds" | "id" | "perStackBonuses">,
): WeaponPassiveModule => ({
  onKitEvent: (event, { kitEffectState }, combatant) => {
    if (
      event.kind !== KitEventKind.DamageTaken ||
      event.striker.characterId !== combatant.characterId ||
      !checkIsNormalOrChargedAttack(event.attackTag)
    )
      return;
    addPassiveStack(kitEffectState, combatant.characterId, {
      ...passive,
      maximumStacks: ATTACK_STACK_MAXIMUM_STACKS,
      seconds: ATTACK_STACK_SECONDS,
    });
  },
});
