import { selectUserSchema } from "@/db/schema/users";
import { type z } from "zod";

// We have to move this here instead of leaving it on the server routes code unfortunately
// because we want to use the UpdateUserInput type in client-side code as well :C
export const updateUserInputSchema = selectUserSchema.pick({ name: true });
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
