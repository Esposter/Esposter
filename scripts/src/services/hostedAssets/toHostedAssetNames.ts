import type { HostedAssetName, HostedAssetObject } from "hosted-assets";

// A lock's map as the objects it names: each entry names its object by its own scope and extension, which a reader of the
// Same entry fetches the object by, so the walk and the reader never name one object two ways
export const toHostedAssetNames = (objectMap: Record<string, HostedAssetObject>): HostedAssetName[] =>
  Object.values(objectMap).map(({ extension, scope, sha256 }) => ({ extension, scope, sha256 }));
