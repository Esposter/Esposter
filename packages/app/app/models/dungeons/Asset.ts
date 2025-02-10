import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";

import { fileKeySchema } from "@/models/dungeons/keys/FileKey";
import { spriteSheetKeySchema } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { z } from "zod";

export interface Asset {
  // By default, this will be 0
  frame?: number;
  key: FileKey | SpritesheetKey;
}

export const assetSchema = z.object({
  frame: z.number().int().nonnegative().optional(),
  key: z.union([fileKeySchema, spriteSheetKeySchema]),
}) satisfies z.ZodType<Asset>;
