import type { ESTree } from "@oxlint/plugins";

import { checkIsPureExpression } from "#src/services/oxlint/sorting/checkIsPureExpression";

// An item's evaluated part: the first of the expressions it evaluates that runs code, which a sort keeps in place. An
// Item whose expressions are all pure has none, and an absent part is a missing key rather than an `undefined` one,
// Which An optional property does not hold under `exactOptionalPropertyTypes`
export const withEvaluated = (...expressions: (ESTree.Node | null | undefined)[]): { evaluated?: ESTree.Node } => {
  const evaluated = expressions.find(
    (expression) => expression !== null && expression !== undefined && !checkIsPureExpression(expression),
  );
  return evaluated ? { evaluated } : {};
};
