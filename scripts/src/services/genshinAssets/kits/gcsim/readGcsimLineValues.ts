import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The numbers the expressions on one line of a gcsim file evaluate to, each expression read from every token, so an
// Expression nested in a call's arguments is read as well as the call. A name resolves through `resolveName`, which a
// Loop's index uses to take each of its values
export const readGcsimLineValues = (
  line: string,
  resolveName: (name: string) => GoValue | undefined = () => undefined,
): number[] => {
  const tokens = tokenizeGo(line);
  const values: number[] = [];
  for (let position = 0; position < tokens.length; position++) {
    const { expression } = parseGoExpression(tokens, position);
    const value = evaluateGoNumber(expression, resolveName);
    if (value !== undefined) values.push(value);
  }
  return values;
};
