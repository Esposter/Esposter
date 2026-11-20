import { threadIdentityInputSchema } from "#shared/models/db/message/ThreadIdentityInput";
import { z } from "zod";

export const followThreadInputSchema = z.object({ ...threadIdentityInputSchema.shape });
export type FollowThreadInput = z.infer<typeof followThreadInputSchema>;
