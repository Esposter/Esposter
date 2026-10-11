import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoNamedConstant } from "#src/models/genshinAssets/kits/gcsim/GoNamedConstant";

// The constant of the first of the names the package defines
export const findGcsimConstant = (
  constantMap: ReadonlyMap<string, GoConstant>,
  ...names: string[]
): GoNamedConstant | undefined => {
  for (const name of names) {
    const constant = constantMap.get(name);
    if (constant !== undefined) return { ...constant, name };
  }
  return undefined;
};
