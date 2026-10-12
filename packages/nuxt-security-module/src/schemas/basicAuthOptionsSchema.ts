import type { BasicAuthOptions } from "#src/models/BasicAuthOptions";

import { z } from "zod";

const pathSchema = z.string().startsWith("/");

export const basicAuthOptionsSchema: z.ZodObject<
  {
    exclude: z.ZodOptional<z.ZodArray<z.ZodString>>;
    include: z.ZodOptional<z.ZodArray<z.ZodString>>;
    message: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    pass: z.ZodString;
  },
  z.core.$strict
> = z.strictObject({
  exclude: z.array(pathSchema).optional(),
  include: z.array(pathSchema).optional(),
  message: z.string().optional(),
  name: z.string().min(1),
  pass: z.string().min(1),
}) satisfies z.ZodType<BasicAuthOptions>;
