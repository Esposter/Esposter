import type { z } from "zod";

import { selectResourceSchema } from "@esposter/db-schema";

export const resourceIdInputSchema = selectResourceSchema.pick({ id: true });
export type ResourceIdInput = z.infer<typeof resourceIdInputSchema>;
