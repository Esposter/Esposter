import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";

// `tiled:gen` rewrites a generated file whole, so what the app derives from a generated enum lives beside its consumers
export const BaseTilesetKeys = Object.values(BaseTilesetKey);

export const ObjectgroupNames = Object.values(ObjectgroupName);
