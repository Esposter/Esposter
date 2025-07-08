import type { AssetKey } from "#shared/models/dungeons/keys/AssetKey";

import { assetKeySchema } from "#shared/models/dungeons/keys/AssetKey";
import { z } from "zod/v4";

export interface Asset {
  // By default, this will be 0
  frame?: number;
  key: AssetKey;
}

export const assetSchema = z.object({
  frame: z.int().nonnegative().optional(),
  key: assetKeySchema,
}) satisfies z.ZodType<Asset>;
