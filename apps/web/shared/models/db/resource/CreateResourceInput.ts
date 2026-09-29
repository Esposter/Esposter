import type { z } from "zod";

import { selectResourceInResourceSchema } from "@esposter/db-schema";

export const createResourceInputSchema = selectResourceInResourceSchema.pick({ name: true });
export type CreateResourceInput = z.infer<typeof createResourceInputSchema>;
