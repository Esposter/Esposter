import type { z } from "zod";

import { selectUserInAuthSchema } from "@esposter/db-schema";

export const searchUsersInputSchema = selectUserInAuthSchema.shape.name;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;
