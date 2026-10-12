import type { TMXExternalTilesetParsed } from "parse-tmx";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { getFilename } from "@/util/file/getFilename";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { outputFile } from "@@/scripts/services/outputFile";
import { TILED_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { PROPERTY_TYPES_DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { createEnumString } from "@@/scripts/util/createEnumString";

export const createBaseTilesetKey = async (tilesets: TMXExternalTilesetParsed[]) => {
  const tilesetKeys = new Set<string>();
  const enumName = "BaseTilesetKey";

  for (const { source } of tilesets) {
    const filename = getFilename(source);
    const tilesetKey = trimFileExtension(filename);
    tilesetKeys.add(tilesetKey);
  }

  await outputFile(
    TILED_ROOT_DIRECTORY,
    `${PROPERTY_TYPES_DIRECTORY}/${PropertyType.Enum}/${enumName}.ts`,
    createEnumString(enumName, [...tilesetKeys]),
  );
};
