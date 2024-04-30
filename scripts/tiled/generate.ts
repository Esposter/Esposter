import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { generateLayerName } from "@/scripts/tiled/generateLayerName";
import { generatePropertyTypes } from "@/scripts/tiled/generatePropertyTypes";
import type { TiledProject } from "@/scripts/tiled/models/TiledProject";
import { remove } from "@/scripts/tiled/util/remove";
import { jsonDateParse } from "@/util/jsonDateParse";
import { uncapitalize } from "@/util/text/uncapitalize";
import { readFile } from "node:fs/promises";
import type { TMXTiledMap } from "tmx-map-parser";
import { tmx } from "tmx-map-parser";

await remove();

for (const tilemapKey of Object.values(TilemapKey)) {
  const filePath = `assets/dungeons/world/${uncapitalize(tilemapKey)}/${uncapitalize(tilemapKey)}`;
  const tiledProject: TiledProject = jsonDateParse(await readFile(`${filePath}.tiled-project`, "utf-8"));
  await generatePropertyTypes(tiledProject.propertyTypes);

  const tilemap = (await tmx(await readFile(`${filePath}.tmx`, "utf-8"))) as TMXTiledMap;
  await generateLayerName(tilemap.layers);
}
