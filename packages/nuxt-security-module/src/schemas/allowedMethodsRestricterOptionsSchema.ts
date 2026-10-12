import type { AllowedMethodsRestricterOptions } from "#src/models/AllowedMethodsRestricterOptions";

import { z } from "zod";

export const allowedMethodsRestricterOptionsSchema: z.ZodObject<{ methods: z.ZodArray<z.ZodString> }, z.core.$strict> =
  z.strictObject({ methods: z.array(z.string().min(1)).min(1) }) satisfies z.ZodType<AllowedMethodsRestricterOptions>;
