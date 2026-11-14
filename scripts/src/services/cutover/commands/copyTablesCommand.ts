import type { SubCommandsDef } from "citty";

import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { getCloudflareEnvironment } from "#src/services/cutover/getCloudflareEnvironment";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";
import { runCopyTables } from "#src/services/cutover/tables/runCopyTables";
import { defineCommand } from "citty";

export const copyTablesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...environmentArgs,
    delta: {
      default: false,
      description:
        "Copy the rows changed since the full copy began, and the messages changed in each room. A message Azure no longer lists is not removed",
      type: "boolean",
    },
  },
  meta: {
    description:
      "Import the messages and their reactions into each room's object, and copy the Azure Table entities into their typed core tables, keeping each entity's id in the archive. Live after copy-core; in the freeze, after copy-core again, with --delta",
    name: "copy-tables",
  },
  run: async ({ args }) => {
    const variables = readCutoverEnvironment();
    const cloudflareEnvironment = getCloudflareEnvironment(args.environment);
    await runCopyTables({
      archiveBucket: getCutoverArchiveBucketName(args.environment),
      client: createR2Client(),
      connectionString: variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING,
      delta: args.delta,
      executor: createCoreExecutor(cloudflareEnvironment, variables),
      functionsUrl: requireEnvironmentVariable("CUTOVER_FUNCTIONS_URL"),
      secret: requireEnvironmentVariable("CUTOVER_SECRET"),
      sourceDatabaseUrl: variables.SOURCE_DATABASE_URL,
    });
  },
});
