import type { TMXExternalTilesetParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXExternalTilesetParsed";
import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { DIRECTORY } from "@/scripts/tiled/propertyTypes/constants";
import { outputFile } from "@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@/scripts/util/generateEnumString";

export const generateBaseTilesetKey = async (tilesets: TMXExternalTilesetParsed[]) => {
  const tilesetKeyMembers = new Set<string>();

  for (const { source } of tilesets) {
    const filename = source.substring(source.lastIndexOf("/") + 1);
    tilesetKeyMembers.add(filename.substring(0, filename.indexOf(".")));
  }

  const enumName = "BaseTilesetKey";
  await outputFile(
    `${DIRECTORY}/${PropertyType.enum}/${enumName}.ts`,
    generateEnumString(enumName, [...tilesetKeyMembers]),
  );
};
