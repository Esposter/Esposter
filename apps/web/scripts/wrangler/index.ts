import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { CloudflareEnvironment } from "../../../../packages/db-schema/src/models/cloudflare/CloudflareEnvironment.ts";
import { getEnvironmentWrangler } from "../../configuration/wrangler.ts";

// The wrangler configuration `predev` applies the core migrations with: the development environment's bindings, with the
// migrations folder Drizzle writes. It is written under `.wrangler`, which is git-ignored, and not beside the app, because
// Nitro reads a wrangler file there and merges its arrays into the deploy configuration
const LOCAL_WRANGLER_DIRECTORY = ".wrangler/local";
const { d1_databases: databases, ...environmentWrangler } = getEnvironmentWrangler(CloudflareEnvironment.Development);
// The config file sits two folders below the app, so its migrations folder is named from there
const CORE_MIGRATIONS_DIRECTORY = "../../server/db/migrations/core";

mkdirSync(LOCAL_WRANGLER_DIRECTORY, { recursive: true });
writeFileSync(
  join(LOCAL_WRANGLER_DIRECTORY, "wrangler.jsonc"),
  JSON.stringify(
    {
      compatibility_date: "2026-11-01",
      ...environmentWrangler,
      d1_databases: databases.map((database) => ({ ...database, migrations_dir: CORE_MIGRATIONS_DIRECTORY })),
    },
    undefined,
    2,
  ),
);
