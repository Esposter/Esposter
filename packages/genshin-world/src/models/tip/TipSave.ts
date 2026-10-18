import { MAX_SHOWN_TIP_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The tips the world has shown, each once by its id, so a tip is shown once per save
export const tipSaveSchema = z.object({ shown: createUniqueArraySchema(z.int().positive()).max(MAX_SHOWN_TIP_COUNT) });

export type TipSave = z.infer<typeof tipSaveSchema>;
