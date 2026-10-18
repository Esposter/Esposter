import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyKindTraits } from "#src/models/enemy/EnemyKindTraits";

import { EnemyType } from "#src/models/enemy/EnemyType";
import { PoiseType } from "#src/models/enemy/PoiseType";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { isEnemyKindId } from "#src/services/enemy/isEnemyKindId";
import { takeOne } from "@esposter/shared";

// The poise a kind takes when no kind of its type in its family has one, the most common poise of its type
const TYPE_POISE_TYPE_MAP: Record<EnemyType, PoiseType> = {
  [EnemyType.Boss]: PoiseType.Boss,
  [EnemyType.Common]: PoiseType.Minion,
  [EnemyType.Elite]: PoiseType.HumanoidDemiboss,
};

// A kind's traits: the ones the traits map writes for it, else defaults from its row. Its poise and the Mora and materials
// It drops are its family's, the ones the kinds of its family and type share, the poise of its type where they share none.
// Its element, its attack element and its energy drops are its own, so it has none of them, and no energy drops
export const getEnemyKindTraits = (
  enemyKindMap: ReadonlyMap<number, EnemyKind>,
  enemyKindId: number,
): EnemyKindTraits => {
  if (isEnemyKindId(enemyKindId)) return EnemyKindTraitsMap[enemyKindId];
  const { enemyFamily, enemyType } = getEnemyKind(enemyKindMap, enemyKindId);
  const familyTraits = [...enemyKindMap.values()].flatMap((enemyKind) =>
    enemyKind.enemyFamily === enemyFamily && enemyKind.enemyType === enemyType && isEnemyKindId(enemyKind.id)
      ? [EnemyKindTraitsMap[enemyKind.id]]
      : [],
  );
  const poiseTypes = new Set(familyTraits.map(({ poiseType }) => poiseType));
  const enemyDropFamilies = new Set(
    familyTraits.flatMap(({ enemyDropFamily }) => (enemyDropFamily === undefined ? [] : [enemyDropFamily])),
  );
  return {
    energyDrops: [],
    poiseType: poiseTypes.size === 1 ? takeOne([...poiseTypes]) : TYPE_POISE_TYPE_MAP[enemyType],
    ...(enemyDropFamilies.size === 1 ? { enemyDropFamily: takeOne([...enemyDropFamilies]) } : {}),
  };
};
