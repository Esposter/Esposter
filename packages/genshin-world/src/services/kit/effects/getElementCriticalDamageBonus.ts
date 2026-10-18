import type { Element } from "#src/models/Element";
import type { KitEffect } from "#src/models/kit/KitEffect";

// The CRIT DMG a character's strikes of an element take from the effects on the field, summed over every effect that gives
// It. A strike of no element takes none
export const getElementCriticalDamageBonus = (
  effects: readonly KitEffect[],
  characterId: number,
  element: Element | undefined,
): number =>
  element === undefined
    ? 0
    : effects.reduce(
        (bonus, effect) =>
          effect.kind === "elementCriticalDamage" && effect.characterId === characterId && effect.element === element
            ? bonus + effect.amount
            : bonus,
        0,
      );
