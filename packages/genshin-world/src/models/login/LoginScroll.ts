import { z } from "zod";

// The login scene's two rows: the walkway's copies, and the towers' with their bridges and pillars
export interface LoginScroll {
  LoginScene_Bridge01_Vo: LoginScrollRow;
  LoginScene_Build_All: LoginScrollRow;
}
// A row the login scene scrolls past the camera: how many copies of it stand, and how long each copy is in the
// Scene's units
interface LoginScrollRow {
  count: number;
  length: number;
}

const loginScrollRowSchema = z.object({
  count: z.int().positive(),
  length: z.number().positive(),
}) satisfies z.ZodType<LoginScrollRow>;

export const loginScrollSchema = z.object({
  LoginScene_Bridge01_Vo: loginScrollRowSchema,
  LoginScene_Build_All: loginScrollRowSchema,
}) satisfies z.ZodType<LoginScroll>;
