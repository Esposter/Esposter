import type { RenovateRule } from "#src/models/outdatedDependencies/RenovateRule";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Renovate also reads a `matchPackageNames` entry as a minimatch glob (`@scope/**`) or a `/regex/`; the report
// Matches a name exactly and nothing else, so a rule written in either form throws rather than silently holding
// Nothing — the two readers of one policy must agree on what it names.
const PATTERN_REGEX = /[*!]|^\//u;

export const getRenovateRules = (renovateJson: string): RenovateRule[] => {
  const { packageRules = [] } = parseMachineJson<{ packageRules?: Partial<RenovateRule>[] }>(renovateJson);
  const rules = packageRules.filter((rule): rule is RenovateRule => rule.matchPackageNames !== undefined);
  for (const { matchPackageNames } of rules)
    for (const name of matchPackageNames)
      if (PATTERN_REGEX.test(name))
        throw new InvalidOperationError(Operation.Read, "renovate.json", `matchPackageNames pattern ${name}`);
  return rules;
};
