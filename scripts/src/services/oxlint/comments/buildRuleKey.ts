// The key a rule is grouped under: its linter's prefix and its name. An oxlint and an eslint disable of one rule are two
// Groups, since each linter reads only its own directive.
export const buildRuleKey = (prefix: string, rule: string): string => `${prefix} ${rule}`;
