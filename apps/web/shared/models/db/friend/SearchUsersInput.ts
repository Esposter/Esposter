import type { z } from "zod";

import { selectUserSchema } from "@esposter/db-schema";

export const searchUsersInputSchema = selectUserSchema.shape.name;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;
