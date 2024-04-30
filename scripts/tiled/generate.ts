import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { generatePropertyTypes } from "@/scripts/tiled/generatePropertyTypes";
import type { TiledProject } from "@/scripts/tiled/models/TiledProject";
import { remove } from "@/scripts/tiled/util/remove";
import { jsonDateParse } from "@/util/jsonDateParse";
import { uncapitalize } from "@/util/text/uncapitalize";
import { readFile } from "node:fs/promises";

await remove();

for (const tilemapKey of Object.values(TilemapKey)) {
  const tiledProject: TiledProject = jsonDateParse(
    await readFile(
      `assets/dungeons/world/${uncapitalize(tilemapKey)}/${uncapitalize(tilemapKey)}.tiled-project`,
      "utf-8",
    ),
  );
  await generatePropertyTypes(tiledProject.propertyTypes);
}
