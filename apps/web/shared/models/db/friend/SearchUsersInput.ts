import { selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const searchUsersInputSchema = selectUserSchema.shape.name;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;
