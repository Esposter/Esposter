import type { z } from "zod";

import { selectResourceInResourceSchema } from "@esposter/db-schema";

export const resourceIdInputSchema = selectResourceInResourceSchema.pick({ id: true });
export type ResourceIdInput = z.infer<typeof resourceIdInputSchema>;
