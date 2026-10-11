import type { BasicAuthOptions } from "#src/models/BasicAuthOptions";

import * as z from "zod";

const pathSchema = z.string().startsWith("/");

export const basicAuthOptionsSchema = z.strictObject({
  exclude: z.array(pathSchema).optional(),
  include: z.array(pathSchema).optional(),
  message: z.string().optional(),
  name: z.string().min(1),
  pass: z.string().min(1),
}) satisfies z.ZodType<BasicAuthOptions>;
