// The key a rule's disables are grouped under: the directive's prefix and the rule's name.
export const buildRuleKey = (prefix: string, rule: string): string => `${prefix} ${rule}`;
