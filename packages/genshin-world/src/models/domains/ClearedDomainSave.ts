import { MAX_CLEARED_DOMAIN_COUNT, MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The one-time domains the player has cleared, each once, by their entry ids
export const clearedDomainSaveSchema = createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH)).max(
  MAX_CLEARED_DOMAIN_COUNT,
);

export type ClearedDomainSave = z.infer<typeof clearedDomainSaveSchema>;
