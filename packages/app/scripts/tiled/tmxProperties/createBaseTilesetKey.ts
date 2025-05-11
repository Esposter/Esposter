import type { TMXExternalTilesetParsed } from "parse-tmx";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { getFilename } from "@/util/getFilename";
import { trimFileExtension } from "@/util/trimFileExtension";
import { DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { outputFile } from "@@/scripts/tiled/util/outputFile";
import { createEnumString } from "@@/scripts/util/createEnumString";

export const createBaseTilesetKey = async (tilesets: TMXExternalTilesetParsed[]) => {
  const tilesetKeys = new Set<string>();
  const enumName = "BaseTilesetKey";

  for (const { source } of tilesets) {
    const filename = getFilename(source);
    const tilesetKey = trimFileExtension(filename);
    tilesetKeys.add(tilesetKey);
  }

  await outputFile(`${DIRECTORY}/${PropertyType.enum}/${enumName}.ts`, createEnumString(enumName, [...tilesetKeys]));
};
