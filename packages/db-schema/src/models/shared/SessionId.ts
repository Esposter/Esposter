import { AUTH_ID_MAX_LENGTH } from "#src/services/user/constants";
import { z } from "zod";

export const sessionIdSchema = z.object({
  sessionId: z.string().min(1).max(AUTH_ID_MAX_LENGTH),
});
