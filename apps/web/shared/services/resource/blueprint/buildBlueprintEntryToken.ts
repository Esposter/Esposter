// The `{{entry:<key>}}` alias a captured cross-resource reference is rewritten to, and the token deploy
// Substitutes back to a created resource id — one grammar, so capture and deploy can never disagree
export const buildBlueprintEntryToken = (key: string): string => `{{entry:${key}}}`;
