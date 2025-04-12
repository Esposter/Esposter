import type { Chest } from "#shared/models/dungeons/data/world/Chest";
import type { Type } from "arktype";

import { chestSchema } from "#shared/models/dungeons/data/world/Chest";
import { type } from "arktype";

export class WorldData {
  chestMap: Record<string, Chest> = {};
}

export const worldDataSchema = type({
  chestMap: type.Record("string > 0", chestSchema),
}) satisfies Type<WorldData>;
