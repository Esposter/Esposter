import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { CutoverEnvironmentVariables } from "#src/models/cutover/CutoverEnvironmentVariables";

import { createD1HttpExecutor } from "#src/services/cutover/cloudflare/d1/createD1HttpExecutor";

// The `core` database, the only Cloudflare database the cutover writes, reached with the token read from the environment
export const createCoreExecutor = (environment: CutoverEnvironmentVariables): D1Executor =>
  createD1HttpExecutor({
    accountId: environment.CLOUDFLARE_ACCOUNT_ID,
    databaseId: environment.CLOUDFLARE_D1_CORE_DATABASE_ID,
    token: environment.CLOUDFLARE_API_TOKEN,
  });
