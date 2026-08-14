// The one separator every composite string is built from — a blob name, a mutation key over two ids, a per-key
// Store slice, a rendered :key, a list item id. Never a hyphen, because uuids contain hyphens and a hyphenated
// Key cannot be split back into its parts; never a colon, because these strings reach blob names and windows
// Rejects it in a path. Two conventions in one codebase means every new key picks one at random
export const ID_SEPARATOR = "|";
// Characters in the canonical string form `crypto.randomUUID` returns.
export const UUID_LENGTH = 36;
