import type { CorsHandlerOptions } from "#src/models/CorsHandlerOptions";

import * as z from "zod";

const headerNameSchema = z.string().regex(/^[\w-]+$/u);

export const corsHandlerOptionsSchema: z.ZodType<CorsHandlerOptions> = z.strictObject({
  allowHeaders: z.array(headerNameSchema).optional(),
  credentials: z.boolean().optional(),
  exposeHeaders: z.array(headerNameSchema).optional(),
  maxAge: z.string().regex(/^\d+$/u).optional(),
  methods: z.array(z.string().min(1)).min(1),
  origin: z.union([z.url(), z.array(z.url())]),
  preflight: z.strictObject({ statusCode: z.int().min(200).max(299) }).optional(),
});
