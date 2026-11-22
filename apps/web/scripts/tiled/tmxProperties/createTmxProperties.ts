import type { LayerData } from "#scripts/tiled/models/LayerData";
import type { TMXExternalTilesetParsed } from "parse-tmx";

import { WORLD_ROOT_DIRECTORY } from "#scripts/tiled/constants";
import { createLayers } from "#scripts/tiled/layers/createLayers";
import { createBaseTilesetKey } from "#scripts/tiled/tmxProperties/createBaseTilesetKey";
import { getTilemapDirectory } from "#scripts/tiled/util/getTilemapDirectory";
import { TilemapKeys } from "#shared/models/dungeons/keys/TilemapKey";
import { readFile } from "node:fs/promises";
import { parseTmx } from "parse-tmx";

export const createTmxProperties = async () => {
  const layersData: LayerData[] = [];
  const externalTilesets: TMXExternalTilesetParsed[] = [];

  const tilemaps = await Promise.all(
    TilemapKeys.map(async (key) => ({
      key,
      map: (
        await parseTmx(await readFile(`${WORLD_ROOT_DIRECTORY}/${getTilemapDirectory(key)}/index.tmx`, "utf8"))
      ).match(
        (tmxParsed) => tmxParsed.map,
        (error) => {
          throw error;
        },
      ),
    })),
  );
  for (const {
    key,
    map: { layers, tilesets },
  } of tilemaps) {
    layersData.push({ key, layers });
    // An external tileset names its file by its source; an embedded one has no file for a base tileset key to name
    externalTilesets.push(...tilesets.filter((tileset): tileset is TMXExternalTilesetParsed => "source" in tileset));
  }

  await Promise.all([createLayers(layersData), createBaseTilesetKey(externalTilesets)]);
};
