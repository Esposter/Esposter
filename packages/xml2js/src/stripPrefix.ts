// The lookahead names the reserved prefix in full: `xmlns` alone also spares an ordinary `xmlnsfoo:` prefix.
// That is a namespaced name like any other and owes its local name back
const PREFIX_MATCH_REGEX = /^(?!xmlns:).*:/u;

export const stripPrefix = (string: string): string => string.replace(PREFIX_MATCH_REGEX, "");
