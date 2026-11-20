import { threadIdentityInputSchema } from "#shared/models/db/message/ThreadIdentityInput";
import { z } from "zod";

export const readThreadInputSchema = z.object({ ...threadIdentityInputSchema.shape });
export type ReadThreadInput = z.infer<typeof readThreadInputSchema>;
