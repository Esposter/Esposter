import type { EnemyKind } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A kind's English name, which its wiki article is titled by, read from the English text its name's text id names
export const toEnemyKindName = (
  { id, nameTextId }: Pick<EnemyKind, "id" | "nameTextId">,
  englishTextMap: ReadonlyMap<string, string>,
): string => {
  const name = englishTextMap.get(nameTextId);
  if (name === undefined) throw new InvalidOperationError(Operation.Read, String(id), "has no English name");
  return name;
};
