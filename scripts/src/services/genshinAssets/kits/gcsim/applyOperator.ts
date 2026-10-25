import type { GoOperand } from "#src/models/genshinAssets/kits/gcsim/GoOperand";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { toGoNumberValue } from "#src/services/genshinAssets/kits/gcsim/toGoNumberValue";

export const applyOperator = (operator: string, left: GoOperand, right: GoOperand): GoValue | undefined => {
  const isFloat = left.isFloat || right.isFloat;
  let value: number;
  if (operator === "+") value = left.value + right.value;
  else if (operator === "-") value = left.value - right.value;
  else if (operator === "*") value = left.value * right.value;
  // Two whole numbers divide as Go's integers do, truncating, and a float operand keeps the fraction
  else if (operator === "/") value = isFloat ? left.value / right.value : Math.trunc(left.value / right.value);
  else if (operator === "%") value = left.value % right.value;
  else return undefined;
  return toGoNumberValue(value, isFloat);
};
