import type { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { assetKeySchema } from "@/models/dungeons/keys/AssetKey";
import { z } from "zod";

export interface Asset {
  key: AssetKey;
  // By default, this will be 0
  frame?: number;
}

export const assetSchema = z.object({
  key: assetKeySchema,
  frame: z.number().int().nonnegative().optional(),
}) satisfies z.ZodType<Asset>;
