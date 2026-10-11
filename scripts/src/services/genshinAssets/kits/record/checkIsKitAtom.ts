const ATOM_KEYS = new Set(
  [
    ["angle", "height", "radius"],
    ["index", "proudSkillGroupId"],
  ].map((keys) => keys.join(",")),
);

// Whether a value of a kit's record is one value rather than a node holding several: an area, or a table's parameter
export const checkIsKitAtom = (value: unknown): boolean =>
  typeof value !== "object" ||
  value === null ||
  (!Array.isArray(value) && ATOM_KEYS.has(Object.keys(value).toSorted().join(",")));
