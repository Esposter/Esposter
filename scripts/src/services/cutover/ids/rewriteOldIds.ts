// A UUID in the lowercase form every store holds
const OLD_ID_SOURCE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const OLD_ID_REGEX = new RegExp(`(?<![\\w-])${OLD_ID_SOURCE}(?![\\w-])`, "gu");
const OLD_ID_EXACT_REGEX = new RegExp(`^${OLD_ID_SOURCE}$`, "u");

// Whether a value is an old UUID, the whole of it
export const checkIsOldId = (value: string): boolean => OLD_ID_EXACT_REGEX.test(value);

// Replaces each old UUID the map names with its new id, wherever it stands.
// That is a key, a foreign key, a value inside JSON, or a token in a stored object's key or content.
// A UUID is collision-free, so a replace by whole token changes nothing else
export const rewriteOldIds = (text: string, newIdByOldId: ReadonlyMap<string, string>): string =>
  text.replaceAll(OLD_ID_REGEX, (oldId) => newIdByOldId.get(oldId) ?? oldId);
