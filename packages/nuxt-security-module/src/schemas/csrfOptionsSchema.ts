import type { CsrfOptions } from "#src/models/CsrfOptions";

import { z } from "zod";

// A cookie or header name is a token, so a name that needs quoting or contains a space is refused at build
const tokenNameSchema = z.string().regex(/^[\w-]+$/u, "must be letters, digits, underscores or hyphens");

export const csrfOptionsSchema: z.ZodType<CsrfOptions> = z.strictObject({
  cookieName: tokenNameSchema,
  headerName: tokenNameSchema,
});
