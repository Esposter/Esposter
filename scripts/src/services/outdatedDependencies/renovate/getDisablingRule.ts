import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";

import { getLastSettingRule } from "#src/services/outdatedDependencies/renovate/getLastSettingRule";

// The rule switching a package off. Renovate merges every matching rule in order with a later key overriding an
// Earlier one, so the last rule to set `enabled` decides
export const getDisablingRule = (packageName: string, rules: RenovateRule[]): RenovateRule | undefined => {
  const enabledRule = getLastSettingRule(rules, packageName, "enabled");
  return enabledRule?.enabled === false ? enabledRule : undefined;
};
