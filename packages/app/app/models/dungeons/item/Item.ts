import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { ItemEffect } from "@/models/dungeons/item/ItemEffect";

import { itemEffectSchema } from "@/models/dungeons/item/ItemEffect";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { fileKeySchema } from "@/models/dungeons/keys/FileKey";
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
  quantity: z.number().int().positive(),
}) satisfies z.ZodType<Item>;
