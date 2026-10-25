import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const getGrowCurve = ({ id, propGrowCurves }: MonsterRow, property: string): string => {
  const growCurve = propGrowCurves.find(({ type }) => type === property)?.growCurve;
  if (!growCurve) throw new InvalidOperationError(Operation.Read, String(id), `grows ${property} by no curve`);
  return growCurve;
};
