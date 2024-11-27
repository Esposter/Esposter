import type { TMXExternalTilesetParsed } from "parse-tmx";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { getFilename } from "@/util/getFilename";
import { DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { outputFile } from "@@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@@/scripts/util/generateEnumString";

export const generateBaseTilesetKey = async (tilesets: TMXExternalTilesetParsed[]) => {
  const tilesetKeys = new Set<string>();

  for (const { source } of tilesets) {
    const filename = getFilename(source);
    tilesetKeys.add(filename.substring(0, filename.indexOf(".")));
  }

  const enumName = "BaseTilesetKey";
  await outputFile(`${DIRECTORY}/${PropertyType.enum}/${enumName}.ts`, generateEnumString(enumName, [...tilesetKeys]));
};
