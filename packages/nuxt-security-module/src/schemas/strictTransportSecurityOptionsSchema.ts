import type { StrictTransportSecurity } from "#src/models/StrictTransportSecurity";

import { z } from "zod";

export const strictTransportSecurityOptionsSchema: z.ZodType<StrictTransportSecurity> = z.strictObject({
  includeSubdomains: z.boolean(),
  maxAge: z.int().nonnegative(),
  preload: z.boolean(),
});
