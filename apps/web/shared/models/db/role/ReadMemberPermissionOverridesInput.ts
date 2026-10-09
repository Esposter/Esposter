import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMemberPermissionOverridesInputSchema = z.object({ ...roomIdSchema.shape });
export type ReadMemberPermissionOverridesInput = z.infer<typeof readMemberPermissionOverridesInputSchema>;
