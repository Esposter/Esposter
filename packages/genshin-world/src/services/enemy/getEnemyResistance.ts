import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";

// An enemy's RES to an element, or its Physical RES, as its statuses leave it: its kind's less each status's reduction
// Of it
export const getEnemyResistance = (
  { elementResistances, physicalResistance }: EnemyKind,
  { statuses }: Pick<Enemy, "statuses">,
  element: Element | undefined,
): number =>
  element === undefined
    ? physicalResistance -
      statuses.reduce((total, { physicalResistanceReduction }) => total + (physicalResistanceReduction ?? 0), 0)
    : elementResistances[element] -
      statuses.reduce((total, { resistanceReduction }) => total + (resistanceReduction?.[element] ?? 0), 0);
