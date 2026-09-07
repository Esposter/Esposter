// Bounds on a manifest — deploy walks and creates every entry synchronously, so the caps keep one
// Deploy call from fanning out into an unbounded batch of resource creates
export const MAX_BLUEPRINT_ENTRIES = 50;
export const MAX_BLUEPRINT_PARAMETERS = 20;
export const MAX_BLUEPRINT_KEY_LENGTH = 100;
export const MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH = 500;

// `{{parameter:<key>}}` — replaced with the deploy-time parameter value in entry names and content strings.
// `{{entry:<key>}}` — replaced with the created resource id of that entry (late-bound cross-resource link).
// Both grammars share the `{{<kind>:<key>}}` shape, and both earn their bound from the delimiters that
// Define the token: a lazy body between `{{` and `}}` stops at the first terminator without the key charset
// Having to guess which characters end it ([content token rewriting](/docs/architecture/content-token-rewriting))
export const BLUEPRINT_PARAMETER_TOKEN_REGEX = /\{\{parameter:(?<key>.+?)\}\}/gu;
export const BLUEPRINT_ENTRY_TOKEN_REGEX = /\{\{entry:(?<key>.+?)\}\}/gu;
