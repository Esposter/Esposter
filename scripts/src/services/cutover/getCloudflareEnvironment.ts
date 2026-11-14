import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { CloudflareEnvironment } from "@esposter/db-schema";

// The command line's `develop` names the Cloudflare environment that the naming function spells `dev`
export const getCloudflareEnvironment = (environment: CutoverEnvironment): CloudflareEnvironment =>
  environment === "develop" ? CloudflareEnvironment.Development : CloudflareEnvironment.Production;
