import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { CutoverEnvironmentVariables } from "#src/models/cutover/CutoverEnvironmentVariables";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { createD1HttpExecutor } from "#src/services/cutover/cloudflare/d1/createD1HttpExecutor";
import { CloudflareCoreDatabaseIdMap } from "@esposter/db-schema";

// The `core` database of the Cloudflare environment, the only Cloudflare database the cutover writes, reached with the
// token read from the environment
export const createCoreExecutor = (
  cloudflareEnvironment: CloudflareEnvironment,
  variables: CutoverEnvironmentVariables,
): D1Executor =>
  createD1HttpExecutor({
    accountId: variables.CLOUDFLARE_ACCOUNT_ID,
    databaseId: CloudflareCoreDatabaseIdMap[cloudflareEnvironment],
    token: variables.CLOUDFLARE_API_TOKEN,
  });
