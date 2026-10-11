import type { ModuleOptions } from "#src/models/ModuleOptions";

import { allowedMethodsRestricterOptionsSchema } from "#src/schemas/allowedMethodsRestricterOptionsSchema";
import { basicAuthOptionsSchema } from "#src/schemas/basicAuthOptionsSchema";
import { corsHandlerOptionsSchema } from "#src/schemas/corsHandlerOptionsSchema";
import { rateLimiterOptionsSchema } from "#src/schemas/rateLimiterOptionsSchema";
import { csrfOptionsSchema } from "#src/schemas/csrfOptionsSchema";
import { requestSizeLimiterOptionsSchema } from "#src/schemas/requestSizeLimiterOptionsSchema";
import { securityHeadersSchema } from "#src/schemas/securityHeadersSchema";
import { ssgOptionsSchema } from "#src/schemas/ssgOptionsSchema";
import * as z from "zod";

// An unknown key is refused, so a misspelt option fails the build rather than being ignored
export const moduleOptionsSchema: z.ZodType<ModuleOptions> = z.strictObject({
  allowedMethodsRestricter: z.union([allowedMethodsRestricterOptionsSchema, z.literal(false)]),
  basicAuth: z.union([basicAuthOptionsSchema, z.literal(false)]),
  contentSecurityPolicyReportOnly: z.boolean(),
  corsHandler: z.union([corsHandlerOptionsSchema, z.literal(false)]),
  csrf: z.union([csrfOptionsSchema, z.literal(false)]),
  enabled: z.boolean(),
  headers: z.union([securityHeadersSchema, z.literal(false)]),
  hidePoweredBy: z.boolean(),
  nonce: z.boolean(),
  rateLimiter: z.union([rateLimiterOptionsSchema, z.literal(false)]),
  requestSizeLimiter: z.union([requestSizeLimiterOptionsSchema, z.literal(false)]),
  sri: z.boolean(),
  strict: z.boolean(),
  ssg: z.union([ssgOptionsSchema, z.literal(false)]),
});
