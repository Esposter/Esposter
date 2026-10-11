import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";

import * as z from "zod";

export const permissionsPolicySchema: z.ZodType<PermissionsPolicy> = z.record(
  z.string().min(1),
  z.union([z.literal(false), z.array(z.string().min(1))]).optional(),
);
