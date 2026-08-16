// The one separator every composite *identifier* is built from — a blob name, a mutation key over two ids, a
// Per-key store slice, a rendered :key, a list item id. Never a hyphen, because uuids contain hyphens and a
// Hyphenated key cannot be split back into its parts; never a colon, because these strings reach blob names and
// Windows rejects it in a path. Two conventions in one codebase means every new key picks one at random.
// A url or wire format keeps its own named separator instead (RESOURCE_SORT_BY_SEPARATOR): those strings live in
// Saved links, so they carry a compatibility contract an in-memory key does not, and the two must stay free to diverge
export const ID_SEPARATOR = "|";
// Characters in the canonical string form `crypto.randomUUID` returns.
export const UUID_LENGTH = 36;
