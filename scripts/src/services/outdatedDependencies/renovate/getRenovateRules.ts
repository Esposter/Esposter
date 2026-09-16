import type { RenovateRule } from "#src/models/outdatedDependencies/RenovateRule";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Renovate also reads a `matchPackageNames` entry as a minimatch glob (`@scope/**`, `{h3,unocss}`) or a
// `/regex/`; the report matches a name exactly and nothing else, so a rule written in either form throws rather
// Than silently holding nothing — the two readers of one policy must agree on what it names. Every character
// Minimatch gives a meaning is named here rather than the star alone, since none of them is legal in a package
// Name, so a brace list or a `?` can only be a pattern the report would read as a name matching no dependency.
const PATTERN_REGEX = /[!*?()[\]{}]|^\//u;

export const getRenovateRules = (renovateJson: string): RenovateRule[] => {
  const { packageRules = [] } = parseMachineJson<{ packageRules?: Partial<RenovateRule>[] }>(renovateJson);
  const rules = packageRules.filter((rule): rule is RenovateRule => rule.matchPackageNames !== undefined);
  for (const { matchPackageNames } of rules)
    for (const name of matchPackageNames)
      if (PATTERN_REGEX.test(name))
        throw new InvalidOperationError(Operation.Read, "renovate.json", `matchPackageNames pattern ${name}`);
  return rules;
};
