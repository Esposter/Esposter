import { parseTmx } from "@/lib/tmxParser/parseTmx";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { generateLayers } from "@/scripts/tiled/generateLayers";
import { generatePropertyTypes } from "@/scripts/tiled/generatePropertyTypes";
import type { TiledProject } from "@/scripts/tiled/models/TiledProject";
import { remove } from "@/scripts/tiled/util/remove";
import { jsonDateParse } from "@/util/jsonDateParse";
import { uncapitalize } from "@/util/text/uncapitalize";
import { readFile } from "node:fs/promises";

await remove();

await Promise.all(
  Object.values(TilemapKey).flatMap((k) => {
    const filePath = `assets/dungeons/world/${uncapitalize(k)}/${uncapitalize(k)}`;
    return [
      (async () => {
        const tilemap = await parseTmx(await readFile(`${filePath}.tmx`, "utf-8"));
        await generateLayers(tilemap.layers);
      })(),
      (async () => {
        const tiledProject: TiledProject = jsonDateParse(await readFile(`${filePath}.tiled-project`, "utf-8"));
        await generatePropertyTypes(tiledProject.propertyTypes);
      })(),
    ];
  }),
);