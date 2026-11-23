import { BLUEPRINT_PARAMETER_TOKEN_REGEX } from "#shared/services/resource/blueprint/constants";

// Replaces every `{{parameter:key}}` in one string with its resolved deploy-time value. A key the manifest Never
// Declared resolves to nothing and is left exactly as the content carries it, which is what [content token
// `rewriting](openspec/specs/architecture/content-token-rewriting/design.md`) requires of an unresolvable token —
// Nothing Downstream rejects a leftover token, so a typo'd key ships as its literal text rather than failing The
// Deploy. The Lookup is a Map so a key naming an `Object.prototype` member (`constructor`, `toString`) Resolves to
// Nothing like any Other undeclared key instead of substituting an inherited builtin
export const substituteBlueprintParameterTokens = (value: string, parameterValues: Map<string, string>): string =>
  value.replace(BLUEPRINT_PARAMETER_TOKEN_REGEX, (match, key: string) => parameterValues.get(key) ?? match);
