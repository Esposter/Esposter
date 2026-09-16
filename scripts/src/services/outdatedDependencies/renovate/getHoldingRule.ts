import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";
import type { RenovateRule } from "#src/models/outdatedDependencies/RenovateRule";

import { satisfies } from "semver";

// The rule under which Renovate would not propose `latest` for this package: the package is disabled, or `latest`
// Falls outside its `allowedVersions`. Renovate merges every matching rule in order with a later key overriding an
// Earlier one, so each key is read from the last rule that sets it, and the rule that set the holding key is the
// Answer — its description is the reason the report prints.
export const getHoldingRule = (
  { latest, pkg }: OutdatedDependency,
  rules: RenovateRule[],
): RenovateRule | undefined => {
  const matchingRules = rules.filter(({ matchPackageNames }) => matchPackageNames.includes(pkg));
  const enabledRule = matchingRules.findLast(({ enabled }) => enabled !== undefined);
  if (enabledRule?.enabled === false) return enabledRule;

  const allowedVersionsRule = matchingRules.findLast(({ allowedVersions }) => allowedVersions !== undefined);
  if (
    allowedVersionsRule?.allowedVersions !== undefined &&
    !satisfies(latest, allowedVersionsRule.allowedVersions, { includePrerelease: true })
  )
    return allowedVersionsRule;

  return undefined;
};
