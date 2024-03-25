import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { imageKeySchema } from "@/models/dungeons/keys/image/ImageKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { spriteSheetKeySchema } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { z } from "zod";

export interface Asset {
  key: ImageKey | SpritesheetKey;
  // By default, this will be 0
  frame?: number;
}

export const assetSchema = z.object({
  key: z.union([imageKeySchema, spriteSheetKeySchema]),
  frame: z.number().int().nonnegative().optional(),
}) satisfies z.ZodType<Asset>;
