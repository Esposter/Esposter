import type { AllowedMethodsRestricterOptions } from "#src/models/AllowedMethodsRestricterOptions";

import { z } from "zod";

export const allowedMethodsRestricterOptionsSchema: z.ZodType<AllowedMethodsRestricterOptions> = z.strictObject({
  methods: z.array(z.string().min(1)).min(1),
});
