import type { SubCommandsDef } from "citty";

import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { runCopyTables } from "#src/services/cutover/tables/runCopyTables";
import { defineCommand } from "citty";

export const copyTablesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...environmentArgs,
    delta: {
      default: false,
      description: "Copy the entities changed since the full copy began, link them, and remove the rows Azure no longer lists",
      type: "boolean",
    },
  },
  meta: {
    description:
      "Copy the Azure Table entities into their typed core tables (messages and their emoji reactions), keeping each entity's id in the archive. Live after copy-core; in the freeze, after copy-core again, with --delta",
    name: "copy-tables",
  },
  run: async ({ args }) => {
    const variables = readCutoverEnvironment();
    await runCopyTables({
      archiveBucket: getCutoverArchiveBucketName(args.environment),
      client: createR2Client({
        accessKeyId: variables.R2_ACCESS_KEY_ID,
        accountId: variables.CLOUDFLARE_ACCOUNT_ID,
        secretAccessKey: variables.R2_SECRET_ACCESS_KEY,
      }),
      connectionString: variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING,
      delta: args.delta,
      executor: createCoreExecutor(variables),
    });
  },
});
