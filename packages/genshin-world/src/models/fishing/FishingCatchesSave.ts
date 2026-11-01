import {
  MAX_FISHING_CATCH_COUNT,
  MAX_FISHING_STOCK_COUNT,
  MAX_SAVE_ID_LENGTH,
  MAX_SAVE_INSTANT_LENGTH,
} from "#src/services/save/constants";
import { createRecordSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The catches each stock holds that are not yet back, by the stock's key, each catch as an ISO instant on the server's clock
export const fishingCatchesSaveSchema = createRecordSchema(
  z.string().max(MAX_SAVE_ID_LENGTH),
  createUniqueArraySchema(z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH)).max(MAX_FISHING_CATCH_COUNT),
  MAX_FISHING_STOCK_COUNT,
);
