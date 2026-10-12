import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The numbers the expressions on one line of a gcsim file evaluate to, each expression read from every token, so an
// Expression nested in a call's arguments is read as well as the call
export const readGcsimLineValues = (line: string): number[] => {
  const tokens = tokenizeGo(line);
  const values: number[] = [];
  for (let position = 0; position < tokens.length; position++) {
    const { expression } = parseGoExpression(tokens, position);
    const value = evaluateGoExpression(expression, () => undefined);
    if (typeof value === "number") values.push(value);
  }
  return values;
};
