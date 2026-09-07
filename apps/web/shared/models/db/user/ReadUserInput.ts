import type { z } from "zod";

import { selectUserSchema } from "@esposter/db-schema";

export const readUserInputSchema = selectUserSchema.shape.id;
export type ReadUserInput = z.infer<typeof readUserInputSchema>;
