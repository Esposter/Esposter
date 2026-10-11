import { KIT_LENGTH_KEY } from "#src/services/genshinAssets/kits/constants";

const LENGTH_SUFFIX = `.${KIT_LENGTH_KEY}`;
const INDEX_REGEX = /^\d+$/u;

// A kit's record built back from its values by path. An array holds the elements its length gives, so a value past it,
// Or in an array no length is given for, is left out; an element no value fills is left a hole, which the record's
// Schema refuses
export const unflattenKitValues = (valueMap: ReadonlyMap<string, unknown>): Record<string, unknown> => {
  const lengthMap = new Map<string, number>();
  for (const [path, value] of valueMap)
    if (path.endsWith(LENGTH_SUFFIX) && typeof value === "number")
      lengthMap.set(path.slice(0, -LENGTH_SUFFIX.length), value);
  const checkIsInRange = (segments: readonly string[]) =>
    segments.every((segment, index) => {
      if (!INDEX_REGEX.test(segment)) return true;
      const length = lengthMap.get(segments.slice(0, index).join("."));
      return length !== undefined && Number(segment) < length;
    });
  const root: Record<string, unknown> = {};
  const ensureContainer = (segments: readonly string[]): Record<string, unknown> => {
    let container: Record<string, unknown> = root;
    for (const [index, segment] of segments.entries()) {
      const isArray =
        INDEX_REGEX.test(segments[index + 1] ?? "") || lengthMap.has(segments.slice(0, index + 1).join("."));
      container[segment] ??= isArray ? [] : {};
      container = container[segment] as Record<string, unknown>;
    }
    return container;
  };
  for (const path of lengthMap.keys()) {
    const segments = path.split(".");
    if (checkIsInRange(segments)) ensureContainer(segments).length = lengthMap.get(path);
  }
  for (const [path, value] of valueMap) {
    const segments = path.split(".");
    if (path.endsWith(LENGTH_SUFFIX) || value === undefined || !checkIsInRange(segments)) continue;
    ensureContainer(segments.slice(0, -1))[segments.at(-1) ?? ""] = value;
  }
  return root;
};
