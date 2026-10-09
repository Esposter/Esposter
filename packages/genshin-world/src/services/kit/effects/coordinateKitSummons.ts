import type { KitAction } from "#src/models/kit/KitAction";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

// The summons on the team that coordinate with the character on the field, each set going from that character's body as
// It starts one of its normal attacks. Any other action sets none of them going
export const coordinateKitSummons = (action: KitAction, context: KitStepContext): void => {
  if (!context.combatant.kit.normalAttacks.includes(action)) return;
  for (const effect of context.kitEffectState.effects)
    if (effect.kind === "summon") effect.onNormalAttackStart?.(context);
};
