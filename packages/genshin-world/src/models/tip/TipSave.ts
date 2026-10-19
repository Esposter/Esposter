import { MAX_SHOWN_TIP_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

const tipIdsSchema = createUniqueArraySchema(z.int().positive()).max(MAX_SHOWN_TIP_COUNT);
// The tips the world has shown, each once by its id, so a tip is shown once per save. The tips it has triggered and not yet
// Shown wait in the order they are to be shown, so a reload shows them as the save left them
export const tipSaveSchema = z.object({ queued: tipIdsSchema, shown: tipIdsSchema });

export type TipSave = z.infer<typeof tipSaveSchema>;
