import { roomIdSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteMemberPermissionOverrideInputSchema = z.object({ ...roomIdSchema.shape, ...userIdSchema.shape });
export type DeleteMemberPermissionOverrideInput = z.infer<typeof deleteMemberPermissionOverrideInputSchema>;
