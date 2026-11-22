import type * as cloudflare from "@pulumi/cloudflare";

import { createD1Database } from "#src/cloudflare/services/createD1Database";
import { CloudflareDatabaseRole, CloudflareEnvironment } from "@esposter/db-schema";

export const devD1EsposterCore: cloudflare.D1Database = createD1Database(
  CloudflareEnvironment.Development,
  CloudflareDatabaseRole.Core,
);
