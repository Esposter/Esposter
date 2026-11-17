// A rule is narrowed by the test that identifies it: here, the cssRules it holds as a group
export const checkIsGroupingRule = (rule: CSSRule): rule is CSSGroupingRule => "cssRules" in rule;
