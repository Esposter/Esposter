import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";
import type { ESTree } from "@oxlint/plugins";

import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";

// The one shape a sorting node is built in: a name and its node, reading and bound by its own name unless a caller says
// Otherwise, and with an empty value for a rule that sorts by name alone
export const buildSortingNode = (
  name: string,
  node: ESTree.Node,
  options: { dependencyNames?: string[]; evaluated?: ESTree.Node; isOxlintDisabled?: boolean; value?: string } = {},
): SortingNode => ({
  dependencies: [],
  dependencyNames: options.dependencyNames ?? [name],
  ...withEvaluated(options.evaluated),
  isOxlintDisabled: options.isOxlintDisabled ?? false,
  name,
  node,
  value: options.value ?? "",
});
