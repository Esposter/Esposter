import type { AssetKey } from "@/models/dungeons/keys/AssetKey";
import type { Type } from "arktype";

import { assetKeySchema } from "@/models/dungeons/keys/AssetKey";
import { type } from "arktype";

export interface Asset {
  // By default, this will be 0
  frame?: number;
  key: AssetKey;
}

export const assetSchema = type({
  frame: "number.integer >= 0?",
  key: assetKeySchema,
}) satisfies Type<Asset>;
