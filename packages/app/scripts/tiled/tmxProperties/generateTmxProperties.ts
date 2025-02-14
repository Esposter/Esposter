import type { LayerData } from "@@/scripts/tiled/models/LayerData";
import type { TMXExternalTilesetParsed } from "parse-tmx";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { WORLD_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { generateLayers } from "@@/scripts/tiled/layers/generateLayers";
import { generateBaseTilesetKey } from "@@/scripts/tiled/tmxProperties/generateBaseTilesetKey";
import { getTilemapDirectory } from "@@/scripts/tiled/util/getTilemapDirectory";
import { readFile } from "node:fs/promises";
import { parseTmx } from "parse-tmx";

export const generateTmxProperties = async () => {
  const layersData: LayerData[] = [];
  const externalTilesets: TMXExternalTilesetParsed[] = [];

  for (const key of Object.values(TilemapKey)) {
    const {
      map: { layers, tilesets },
    } = await parseTmx(await readFile(`${WORLD_ROOT_DIRECTORY}/${getTilemapDirectory(key)}/index.tmx`, "utf-8"));
    layersData.push({ key, layers });
    externalTilesets.push(...(tilesets as TMXExternalTilesetParsed[]));
  }

  await Promise.all([generateLayers(layersData), generateBaseTilesetKey(externalTilesets)]);
};
