// Whether a directive's rule list covers the rule, by its bare name or any plugin's prefix of it
export const checkIsRuleCovered = (rules: "all" | string[], ruleName: string): boolean =>
  rules === "all" || rules.some((rule) => rule === ruleName || rule.endsWith(`/${ruleName}`));
