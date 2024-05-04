import { parseTmx } from "@/lib/tmxParser/parseTmx";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { generateLayers } from "@/scripts/tiled/generateLayers";
import { generatePropertyTypes } from "@/scripts/tiled/generatePropertyTypes";
import { remove } from "@/scripts/tiled/util/remove";
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
      generatePropertyTypes(),
    ];
  }),
);
