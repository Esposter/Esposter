import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

import { fileKeySchema } from "#shared/models/dungeons/keys/FileKey";
import { spritesheetKeySchema } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import { z } from "zod/v4";

export interface Asset {
  // By default, this will be 0
  frame?: number;
  key: FileKey | SpritesheetKey;
}

export const assetSchema = z.object({
  frame: z.int().nonnegative().optional(),
  key: z.union([fileKeySchema, spritesheetKeySchema]),
}) satisfies z.ZodType<Asset>;
