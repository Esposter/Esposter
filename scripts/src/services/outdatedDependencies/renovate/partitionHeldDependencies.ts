import type { HeldPartition } from "#src/models/outdatedDependencies/renovate/HeldPartition";
import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";
import type { HeldDependency } from "#src/models/outdatedDependencies/shared/HeldDependency";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";

import { getHoldingRule } from "#src/services/outdatedDependencies/renovate/getHoldingRule";

export const partitionHeldDependencies = (
  outdatedDependencies: OutdatedDependency[],
  rules: RenovateRule[],
): HeldPartition => {
  const held: HeldDependency[] = [];
  const outdated: OutdatedDependency[] = [];
  for (const dependency of outdatedDependencies) {
    const rule = getHoldingRule(dependency, rules);
    if (rule) held.push({ dependency, reason: rule.description ?? "" });
    else outdated.push(dependency);
  }
  return { held, outdated };
};
