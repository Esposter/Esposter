import { KIT_LENGTH_KEY } from "#src/services/genshinAssets/kits/constants";
import { checkIsKitAtom } from "#src/services/genshinAssets/kits/record/checkIsKitAtom";

// A kit's record as its values by path, `normalAttacks.0.hits.1.poiseDamage`, each array's length at its own path
// Ending in `length`, an area or a table's parameter as one value, and a field left undefined left out
export const flattenKitValues = (record: unknown): Map<string, unknown> => {
  const valueMap = new Map<string, unknown>();
  const visit = (value: unknown, path: string) => {
    if (value === undefined) return;
    const prefix = path === "" ? "" : `${path}.`;
    if (Array.isArray(value)) {
      valueMap.set(`${prefix}${KIT_LENGTH_KEY}`, value.length);
      for (const [index, element] of value.entries()) visit(element, `${prefix}${index}`);
    } else if (checkIsKitAtom(value)) valueMap.set(path, value);
    else for (const [key, element] of Object.entries(value as object)) visit(element, `${prefix}${key}`);
  };
  visit(record, "");
  return valueMap;
};
