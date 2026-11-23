import type { ESTree } from "@oxlint/plugins";

// An item's evaluated part when it has one. An absent part is a missing key rather than an `undefined` one, which an
// Optional property does not hold under `exactOptionalPropertyTypes`
export const withEvaluated = (evaluated: ESTree.Node | undefined): { evaluated?: ESTree.Node } =>
  evaluated === undefined ? {} : { evaluated };
