import type { z } from "zod";

import { selectUserInAuthSchema } from "@esposter/db-schema";

export const readUserInputSchema = selectUserInAuthSchema.shape.id;
export type ReadUserInput = z.infer<typeof readUserInputSchema>;
