import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";

// The same comparison over records already flattened, so a caller holding both maps walks each record once
export const getMismatchedValuePaths = (
  builtValueMap: ReadonlyMap<string, unknown>,
  publishedValueMap: ReadonlyMap<string, unknown>,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): string[] =>
  [...new Set([...builtValueMap.keys(), ...publishedValueMap.keys()])].filter(
    (path) => !checkIsKitValueResolvedEqual(builtValueMap.get(path), publishedValueMap.get(path), talentMultiplierMap),
  );
