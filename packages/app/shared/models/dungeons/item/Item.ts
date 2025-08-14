import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { ItemEffect } from "#shared/models/dungeons/item/ItemEffect";

import { itemEffectSchema } from "#shared/models/dungeons/item/ItemEffect";
import { itemIdSchema } from "#shared/models/dungeons/item/ItemId";
import { fileKeySchema } from "#shared/models/dungeons/keys/FileKey";
import { z } from "zod";

export interface Item {
  description: string;
  effect: ItemEffect;
  fileKey?: FileKey;
  id: ItemId;
  quantity: number;
}

export const itemSchema = z.object({
  description: z.string().min(1),
  effect: itemEffectSchema,
  fileKey: fileKeySchema.optional(),
  id: itemIdSchema,
  quantity: z.int().positive(),
}) satisfies z.ZodType<Item>;
