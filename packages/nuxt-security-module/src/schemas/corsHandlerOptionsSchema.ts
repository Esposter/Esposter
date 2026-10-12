import type { CorsHandlerOptions } from "#src/models/CorsHandlerOptions";

import { z } from "zod";

const headerNameSchema = z.string().regex(/^[\w-]+$/u);

export const corsHandlerOptionsSchema: z.ZodObject<
  {
    allowHeaders: z.ZodOptional<z.ZodArray<z.ZodString>>;
    credentials: z.ZodOptional<z.ZodBoolean>;
    exposeHeaders: z.ZodOptional<z.ZodArray<z.ZodString>>;
    maxAge: z.ZodOptional<z.ZodString>;
    methods: z.ZodArray<z.ZodString>;
    origin: z.ZodUnion<readonly [z.ZodURL, z.ZodArray<z.ZodURL>]>;
    preflight: z.ZodOptional<z.ZodObject<{ statusCode: z.ZodNumber }, z.core.$strict>>;
  },
  z.core.$strict
> = z.strictObject({
  allowHeaders: z.array(headerNameSchema).optional(),
  credentials: z.boolean().optional(),
  exposeHeaders: z.array(headerNameSchema).optional(),
  maxAge: z.string().regex(/^\d+$/u).optional(),
  methods: z.array(z.string().min(1)).min(1),
  origin: z.union([z.url(), z.array(z.url())]),
  preflight: z.strictObject({ statusCode: z.int().min(200).max(299) }).optional(),
}) satisfies z.ZodType<CorsHandlerOptions>;
