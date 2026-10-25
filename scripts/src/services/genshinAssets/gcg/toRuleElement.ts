import type { Element } from "genshin-world";

import { GcgElementTableNameMap } from "#src/services/genshinAssets/gcg/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const toRuleElement = (tableElementName: string): Element => {
  const element = GcgElementTableNameMap.get(tableElementName);
  if (!element)
    throw new InvalidOperationError(Operation.Read, "standard rule", `the table names no element ${tableElementName}`);
  return element;
};
