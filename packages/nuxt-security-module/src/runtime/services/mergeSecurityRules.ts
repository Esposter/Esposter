import type { SecurityRules } from "#src/models/SecurityRules";

import { createDefu } from "defu";

// The rules of every matching route, the most specific first, merged so that the first to set a key wins.
// An array is replaced rather than concatenated, so a route can narrow a list the rules before it set
const mergeRulesWithReplacedArrays = createDefu((object, key, value) => {
  if (Array.isArray(object[key]) || Array.isArray(value)) {
    object[key] = value;
    return true;
  }

  return undefined;
});

export const mergeSecurityRules = (...rules: SecurityRules[]): SecurityRules =>
  mergeRulesWithReplacedArrays({}, ...rules);
