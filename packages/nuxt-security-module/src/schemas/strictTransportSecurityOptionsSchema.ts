import type { StrictTransportSecurity } from "#src/models/StrictTransportSecurity";

import * as z from "zod";

export const strictTransportSecurityOptionsSchema = z.strictObject({
  includeSubdomains: z.boolean(),
  maxAge: z.int().nonnegative(),
  preload: z.boolean(),
}) satisfies z.ZodType<StrictTransportSecurity>;
