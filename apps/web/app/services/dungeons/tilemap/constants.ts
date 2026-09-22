import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";

// `tiled:gen` rewrites a generated file whole, so what the app derives from a generated enum lives beside its consumers
export const BASE_TILESET_KEYS = Object.values(BaseTilesetKey);

export const OBJECTGROUP_NAMES = Object.values(ObjectgroupName);
