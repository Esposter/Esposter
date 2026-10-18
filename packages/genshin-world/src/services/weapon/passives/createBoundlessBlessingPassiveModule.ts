import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const BOUNDLESS_BLESSING_ID = "boundlessBlessing";
const BOUNDLESS_BLESSING_CLOCK_ID = "boundlessBlessingClock";
const BOUNDLESS_BLESSING_INTERVAL_SECONDS = 4;
const BOUNDLESS_BLESSING_MAXIMUM_STACKS = 4;

// Drops the stacks, their buffs and the clock that adds them from the wielder, which a swap off the field or a fall does
const clearBoundlessBlessing = (kitEffectState: KitEffectState, characterId: number): void =>
  removeKitEffects(
    kitEffectState,
    (effect) =>
      effect.characterId === characterId &&
      ((effect.kind === "field" && effect.id === BOUNDLESS_BLESSING_CLOCK_ID) ||
        (effect.kind === "status" && effect.id === BOUNDLESS_BLESSING_ID) ||
        (effect.kind === "buff" && effect.source === BOUNDLESS_BLESSING_ID)),
  );

// Boundless Blessing at its rank: its Movement SPD is a passive bonus on the wielder. While the wielder is on the field, every
// Four seconds it gains a stack of the rank's Elemental DMG Bonus on each element, up to four, and the stacks clear when it
// Leaves the field or falls. The clock starts on the wielder's swap onto the field, the battle's opening swap
// Included. Provisional: the stacks are the text's, read without the game's timing
export const createBoundlessBlessingPassiveModule = (params: number[]): WeaponPassiveModule => {
  const movementSpeed = takeOne(params, 0);
  const elementalDamageBonus = takeOne(params, 1);
  return {
    getPassiveBonuses: () => [{ amount: movementSpeed, attribute: Attribute.MovementSpeed }],
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState } = context;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId === characterId) clearBoundlessBlessing(kitEffectState, characterId);
        if (event.characterId !== characterId) return;
        clearBoundlessBlessing(kitEffectState, characterId);
        castKitField(
          kitEffectState,
          characterId,
          { x: 0, z: 0 },
          {
            id: BOUNDLESS_BLESSING_CLOCK_ID,
            nextTickSeconds: BOUNDLESS_BLESSING_INTERVAL_SECONDS,
            onTick: (tickContext) =>
              addPassiveStack(tickContext.kitEffectState, characterId, {
                id: BOUNDLESS_BLESSING_ID,
                maximumStacks: BOUNDLESS_BLESSING_MAXIMUM_STACKS,
                perStackBonuses: ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({
                  amount: elementalDamageBonus,
                  attribute,
                })),
                seconds: Number.POSITIVE_INFINITY,
              }),
            secondsRemaining: Number.POSITIVE_INFINITY,
            tickIntervalSeconds: BOUNDLESS_BLESSING_INTERVAL_SECONDS,
          },
        );
        return;
      }
      if (event.kind === KitEventKind.HealthChanged && event.characterId === characterId && event.healthShare <= 0)
        clearBoundlessBlessing(kitEffectState, characterId);
    },
  };
};
