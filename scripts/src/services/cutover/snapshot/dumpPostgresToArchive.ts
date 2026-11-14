import type { R2Client } from "#src/models/cutover/R2Client";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
import { getPgDumpConnection } from "#src/services/cutover/snapshot/getPgDumpConnection";

// Streams `pg_dump --format=custom` straight into the archive as a multipart upload, so the dump never lands on this disk.
// Its exit status is read after the upload, so a dump that stopped part way is never recorded as complete
export const dumpPostgresToArchive = async (
  client: R2Client,
  archiveBucket: string,
  key: string,
  databaseUrl: string,
): Promise<void> => {
  const connection = getPgDumpConnection(databaseUrl);
  const child = spawn("pg_dump", connection.args, {
    env: { PATH: process.env.PATH ?? "", ...connection.environment },
    stdio: ["ignore", "pipe", "inherit"],
  });
  const exitCode = new Promise<number | null>((resolve) => {
    child.on("close", resolve);
  });
  await client.uploadMultipart(archiveBucket, key, child.stdout);
  const code = await exitCode;
  if (code !== 0) throw new InvalidOperationError(Operation.Read, "pg_dump", `exited with status ${String(code)}`);
};
