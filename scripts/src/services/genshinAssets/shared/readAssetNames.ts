import { readIndexedNames } from "#src/services/genshinAssets/shared/readIndexedNames";

// The name of every asset by its path ID, as the asset index names it: a material a placement draws with, a texture a
// Material's slot holds, each a reference into another file
export const readAssetNames = (pathIds: ReadonlySet<string>): Promise<Map<string, string>> =>
  readIndexedNames(
    ({ pathId }) => pathIds.has(pathId),
    ({ pathId }) => pathId,
  );
