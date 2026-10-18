import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";
import type { PuzzleHit } from "#src/models/puzzle/PuzzleHit";

// The hit a puzzle takes from a hit a step landed: its element, the hit's own or its character's when it names none, and
// Its gauge. A hit that deals no gauge strikes with no element, since an element a hit does not carry lights nothing
export const readPuzzleHit = ({ element: characterElement }: Combatant, hit: KitHit): PuzzleHit => {
  const element = hit.element ?? characterElement;
  const gauge = hit.gauge ?? 0;
  return gauge > 0 && element !== undefined
    ? { element, gauge, hitArea: hit.hitArea }
    : { gauge, hitArea: hit.hitArea };
};
