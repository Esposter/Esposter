import type { SecurityHeaders } from "#src/models/SecurityHeaders";

import { CrossOriginEmbedderPolicy } from "#src/models/CrossOriginEmbedderPolicy";
import { XFrameOptions } from "#src/models/XFrameOptions";
import { contentSecurityPolicySchema } from "#src/schemas/contentSecurityPolicySchema";
import { permissionsPolicySchema } from "#src/schemas/permissionsPolicySchema";
import { strictTransportSecurityOptionsSchema } from "#src/schemas/strictTransportSecurityOptionsSchema";
import * as z from "zod";

// A header sent as a string is written as given, so its value is any non-empty string
const headerValueSchema = z.string().min(1);

export const securityHeadersSchema: z.ZodType<SecurityHeaders> = z.strictObject({
  contentSecurityPolicy: z.union([contentSecurityPolicySchema, z.literal(false)]).optional(),
  crossOriginEmbedderPolicy: z.union([z.enum(CrossOriginEmbedderPolicy), z.literal(false)]).optional(),
  crossOriginOpenerPolicy: z.union([headerValueSchema, z.literal(false)]).optional(),
  crossOriginResourcePolicy: z.union([headerValueSchema, z.literal(false)]).optional(),
  originAgentCluster: z.union([headerValueSchema, z.literal(false)]).optional(),
  permissionsPolicy: z.union([permissionsPolicySchema, z.literal(false)]).optional(),
  referrerPolicy: z.union([headerValueSchema, z.literal(false)]).optional(),
  strictTransportSecurity: z.union([strictTransportSecurityOptionsSchema, z.literal(false)]).optional(),
  xContentTypeOptions: z.union([headerValueSchema, z.literal(false)]).optional(),
  xDNSPrefetchControl: z.union([headerValueSchema, z.literal(false)]).optional(),
  xDownloadOptions: z.union([headerValueSchema, z.literal(false)]).optional(),
  xFrameOptions: z.union([z.enum(XFrameOptions), z.literal(false)]).optional(),
  xPermittedCrossDomainPolicies: z.union([headerValueSchema, z.literal(false)]).optional(),
});
