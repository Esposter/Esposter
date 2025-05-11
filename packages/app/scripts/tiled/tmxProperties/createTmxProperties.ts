import type { LayerData } from "@@/scripts/tiled/models/LayerData";
import type { TMXExternalTilesetParsed } from "parse-tmx";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { WORLD_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { createLayers } from "@@/scripts/tiled/layers/createLayers";
import { createBaseTilesetKey } from "@@/scripts/tiled/tmxProperties/createBaseTilesetKey";
import { getTilemapDirectory } from "@@/scripts/tiled/util/getTilemapDirectory";
import { readFile } from "node:fs/promises";
import { parseTmx } from "parse-tmx";

export const createTmxProperties = async () => {
  const layersData: LayerData[] = [];
  const externalTilesets: TMXExternalTilesetParsed[] = [];

  for (const key of Object.values(TilemapKey)) {
    const {
      map: { layers, tilesets },
    } = await parseTmx(await readFile(`${WORLD_ROOT_DIRECTORY}/${getTilemapDirectory(key)}/index.tmx`, "utf-8"));
    layersData.push({ key, layers });
    externalTilesets.push(...(tilesets as TMXExternalTilesetParsed[]));
  }

  await Promise.all([createLayers(layersData), createBaseTilesetKey(externalTilesets)]);
};
