import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";

import * as z from "zod";

export const contentSecurityPolicySchema: z.ZodType<ContentSecurityPolicy> = z.record(
  z.string().min(1),
  z.union([z.boolean(), z.array(z.string().min(1))]).optional(),
);
