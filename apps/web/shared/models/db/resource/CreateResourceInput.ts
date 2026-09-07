import type { z } from "zod";

import { selectResourceSchema } from "@esposter/db-schema";

export const createResourceInputSchema = selectResourceSchema.pick({ name: true });
export type CreateResourceInput = z.infer<typeof createResourceInputSchema>;
