import { toUuidV7Version } from "#src/services/cutover/ids/toUuidV7Version";

// A UUID in the lowercase form every store holds
const OLD_ID_SOURCE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const OLD_ID_REGEX = new RegExp(`(?<![\\w-])${OLD_ID_SOURCE}(?![\\w-])`, "gu");
const OLD_ID_EXACT_REGEX = new RegExp(`^${OLD_ID_SOURCE}$`, "u");

// Whether a value is an old UUID, the whole of it
export const checkIsOldId = (value: string): boolean => OLD_ID_EXACT_REGEX.test(value);

// Replaces each old UUID the map names with its new id, wherever it stands.
// That is a key, a foreign key, a value inside JSON, or a token in a stored object's key or content.
// A UUIDv4 no row owns, such as a file's, a poll option's or a TodoList item's, has no entry.
// Every id is a UUIDv7, so it becomes one by its version digit alone, and the same old id turns into the same new one.
// That holds in a blob's key, a message's JSON and a content blob alike, with nothing kept to pair them.
// A UUID is collision-free, so a replace by whole token changes nothing else
export const rewriteOldIds = (text: string, oldIdNewIdMap: ReadonlyMap<string, string>): string =>
  text.replaceAll(OLD_ID_REGEX, (oldId) => oldIdNewIdMap.get(oldId) ?? toUuidV7Version(oldId));
