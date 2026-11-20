import { threadIdentityInputSchema } from "#shared/models/db/message/ThreadIdentityInput";
import { z } from "zod";

export const unfollowThreadInputSchema = z.object({ ...threadIdentityInputSchema.shape });
export type UnfollowThreadInput = z.infer<typeof unfollowThreadInputSchema>;
