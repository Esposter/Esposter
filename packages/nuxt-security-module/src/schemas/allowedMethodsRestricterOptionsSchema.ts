import type { AllowedMethodsRestricterOptions } from "#src/models/AllowedMethodsRestricterOptions";

import * as z from "zod";

export const allowedMethodsRestricterOptionsSchema = z.strictObject({
  methods: z.array(z.string().min(1)).min(1),
}) satisfies z.ZodType<AllowedMethodsRestricterOptions>;
