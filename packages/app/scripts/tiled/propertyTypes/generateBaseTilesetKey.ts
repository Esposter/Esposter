import type { TMXExternalTilesetParsed } from "parse-tmx";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { getFilename } from "@/util/getFilename";
import { DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { outputFile } from "@@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@@/scripts/util/generateEnumString";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const generateBaseTilesetKey = async (tilesets: TMXExternalTilesetParsed[]) => {
  const tilesetKeys = new Set<string>();
  const enumName = "BaseTilesetKey";

  for (const { source } of tilesets) {
    const filename = getFilename(source);
    const tilesetKey = filename.substring(0, filename.indexOf("."));
    if (tilesetKeys.has(tilesetKey))
      throw new InvalidOperationError(Operation.Push, enumName, `Duplicate key: ${tilesetKey}`);
    tilesetKeys.add(tilesetKey);
  }

  await outputFile(`${DIRECTORY}/${PropertyType.enum}/${enumName}.ts`, generateEnumString(enumName, [...tilesetKeys]));
};
