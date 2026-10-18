const checkIsJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getDefaultValue = (sample: unknown): 0 | [] | false | Record<string, never> | undefined => {
  if (typeof sample === "number") return 0;
  else if (typeof sample === "boolean") return false;
  else if (Array.isArray(sample)) return [];
  else if (checkIsJsonObject(sample)) return {};
  return undefined;
};

const getKind = (value: unknown): string => (Array.isArray(value) ? "array" : value === null ? "null" : typeof value);

// Writes back the fields the dump left out of `siblings`, the rows of one table or the values at one path within them.
// From 7.1 the dump writes a row as protobuf's JSON does, leaving out every field at its default, so a row holds only
// What it sets. A field another sibling holds is restored in each sibling that lacks it at its kind's default: 0, false,
// An empty list, or an object whose own fields are restored the same way, as protobuf reads an unset message. A string
// Is left out: an enum is written as its name, and the default's name, an enum's zero, is one no other row holds, so a
// Reader of a string field names its own default where the table leaves it out. A field no sibling holds is unknown here
export const fillDumpDefaults = (siblings: unknown[]): void => {
  const objects = siblings.filter((sibling) => checkIsJsonObject(sibling));
  if (objects.length === 0) return;

  for (const key of new Set(objects.flatMap((object) => Object.keys(object)))) {
    const presentValues = objects.map((object) => object[key]).filter((value) => value !== undefined);
    const [sample] = presentValues;
    const kind = getKind(sample);
    // A field held under more than one kind is not one protobuf wrote, so nothing is guessed for it
    if (presentValues.some((value) => getKind(value) !== kind)) continue;

    for (const object of objects) {
      if (object[key] !== undefined) continue;
      const defaultValue = getDefaultValue(sample);
      if (defaultValue !== undefined) object[key] = defaultValue;
    }

    const values = objects.map((object) => object[key]);
    if (kind === "object") fillDumpDefaults(values);
    else if (kind === "array") fillDumpDefaults(values.flatMap((value) => (Array.isArray(value) ? value : [])));
  }
};
