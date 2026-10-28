import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

// The string a package's constant gives a name, such as the `attacks.ICDTagNone` a `c.` field is written as, or the name
// itself when the package gives it no string
export const resolveStringConstant = (constantMap: ReadonlyMap<string, GoConstant>, name: string): string => {
  const value = constantMap.get(name)?.value;
  return typeof value === "string" ? value : name;
};
