import { MAX_OPENED_CHEST_COUNT, MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The chests the player has opened, by their ids, each unique
export const openedChestSaveSchema = createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH)).max(
  MAX_OPENED_CHEST_COUNT,
);

export type OpenedChestSave = z.infer<typeof openedChestSaveSchema>;
