import type { Enemy } from "#src/models/enemy/Enemy";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";

// The elements an absorb check takes, in gcsim's AbsorbCheck priority, each with the auras that hold it as gcsim's
// AuraContains reads them: Pyro in a Pyro or a Burning aura, and Cryo in a Cryo or a Freeze aura
// https://github.com/genshinsim/gcsim/blob/main/pkg/core/combat/absorb.go
// https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/reactable.go
const ABSORBED_ELEMENT_AURA_TYPES: readonly (readonly [Element, readonly AuraType[]])[] = [
  [Element.Pyro, [AuraType.Pyro, AuraType.Burning]],
  [Element.Hydro, [AuraType.Hydro]],
  [Element.Electro, [AuraType.Electro]],
  [Element.Cryo, [AuraType.Cryo, AuraType.Freeze]],
];

// The element an absorb check takes from the enemies it reaches: the first of the four in priority any of them holds,
// Whichever enemy holds it, as gcsim walks its priority ahead of its enemies, or none when none holds one
export const findAbsorbedElement = (reachedEnemies: readonly Pick<Enemy, "elementalState">[]): Element | undefined =>
  ABSORBED_ELEMENT_AURA_TYPES.find(([, auraTypes]) =>
    reachedEnemies.some(({ elementalState: { auras } }) => auraTypes.some((auraType) => auras.has(auraType))),
  )?.[0];
