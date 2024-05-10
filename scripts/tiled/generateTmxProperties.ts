import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TMXExternalTilesetParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXExternalTilesetParsed";
import { parseTmx } from "@/lib/tmxParser/parseTmx";
import { generateLayers } from "@/scripts/tiled/layers/generateLayers";
import type { LayerData } from "@/scripts/tiled/models/LayerData";
import { generateBaseTilesetKey } from "@/scripts/tiled/propertyTypes/generateBaseTilesetKey";
import { getTilemapDirectory } from "@/scripts/util/getTilemapDirectory";
import { readFile } from "node:fs/promises";

export const generateTmxProperties = async () => {
  const layersData: LayerData[] = [];
  const externalTilesets: TMXExternalTilesetParsed[] = [];

  for (const key of Object.values(TilemapKey)) {
    const {
      map: { layers, tilesets },
    } = await parseTmx(await readFile(`assets/dungeons/scene/world/${getTilemapDirectory(key)}/index.tmx`, "utf-8"));
    layersData.push({ key, layers });
    externalTilesets.push(...(tilesets as TMXExternalTilesetParsed[]));
  }

  await Promise.all([generateLayers(layersData), generateBaseTilesetKey(externalTilesets)]);
};
