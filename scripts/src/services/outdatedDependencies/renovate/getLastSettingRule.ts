import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";

// The last rule naming the package that sets `key`. Renovate merges every matching rule in order with a later key
// Overriding an earlier one, so each key is read from the last rule that sets it
export const getLastSettingRule = (
  rules: RenovateRule[],
  packageName: string,
  key: keyof RenovateRule,
): RenovateRule | undefined =>
  rules.findLast((rule) => rule[key] !== undefined && rule.matchPackageNames.includes(packageName));
