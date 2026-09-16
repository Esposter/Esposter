import type { HeldDependency } from "#src/models/outdatedDependencies/HeldDependency";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";
import type { RenovateRule } from "#src/models/outdatedDependencies/RenovateRule";

import { getHoldingRule } from "#src/services/outdatedDependencies/renovate/getHoldingRule";

export const partitionHeldDependencies = (
  outdatedDependencies: OutdatedDependency[],
  rules: RenovateRule[],
): { held: HeldDependency[]; outdated: OutdatedDependency[] } => {
  const held: HeldDependency[] = [];
  const outdated: OutdatedDependency[] = [];
  for (const dependency of outdatedDependencies) {
    const rule = getHoldingRule(dependency, rules);
    if (rule) held.push({ dependency, reason: rule.description ?? "" });
    else outdated.push(dependency);
  }
  return { held, outdated };
};
