import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";

import { z } from "zod";

export const contentSecurityPolicySchema: z.ZodRecord<
  z.ZodString,
  z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodArray<z.ZodString>]>>
> = z.record(
  z.string().min(1),
  z.union([z.boolean(), z.array(z.string().min(1))]).optional(),
) satisfies z.ZodType<ContentSecurityPolicy>;
