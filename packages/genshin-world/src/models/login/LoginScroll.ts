import type { LoginScrollRow } from "#src/models/login/LoginScrollRow";

import { loginScrollRowSchema } from "#src/models/login/LoginScrollRow";
import { z } from "zod";

// The rows MonoLoginScene scrolls past the camera, each laid ahead of its own place and wrapped by its length: the
// Walkway's copies, its own length apart, and the towers' with their bridges and pillars
export interface LoginScroll {
  LoginScene_Bridge01_Vo: LoginScrollRow;
  LoginScene_Build_All: LoginScrollRow;
}

export const loginScrollSchema = z.object({
  LoginScene_Bridge01_Vo: loginScrollRowSchema,
  LoginScene_Build_All: loginScrollRowSchema,
}) satisfies z.ZodType<LoginScroll>;
