import type { Chest } from "#shared/models/dungeons/data/world/Chest";

import { chestSchema } from "#shared/models/dungeons/data/world/Chest";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// A map holds one chest for each chest object placed on it, so this is a generous count of those
export const MAX_CHESTS = 256;
// Two tile coordinates and the separator between them
const CHEST_ID_MAX_LENGTH = 32;

export class WorldData {
  chestMap: Record<string, Chest> = {};
}

export const worldDataSchema = z.object({
  chestMap: createRecordSchema(z.string().min(1).max(CHEST_ID_MAX_LENGTH), chestSchema, MAX_CHESTS),
}) satisfies z.ZodType<WorldData>;
