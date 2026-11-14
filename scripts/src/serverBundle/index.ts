import {
  SERVER_BUNDLE_DIRECTORY,
  SERVER_BUNDLE_REPORTED_FILE_COUNT,
  WORKER_CODE_LIMIT_BYTES,
} from "#src/services/serverBundle/constants";
import { readServerBundle } from "#src/services/serverBundle/readServerBundle";
import { MEBIBYTE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runCommand } from "#src/services/timing/runCommand";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";
import { relative } from "node:path";

const bundleName = relative(REPOSITORY_ROOT, SERVER_BUNDLE_DIRECTORY).replaceAll("\\", "/");
const toMebibytes = (bytes: number) => (bytes / MEBIBYTE).toFixed(2);

await runCommand(
  defineCommand({
    meta: {
      description: "Sum the server bundle a Worker uploads, and fail above the Worker's 64 MiB code limit",
      name: "server-bundle:check",
    },
    run: () => {
      if (!existsSync(SERVER_BUNDLE_DIRECTORY))
        throw new InvalidOperationError(Operation.Read, bundleName, "it has no build, so build the app first");

      const files = readServerBundle(SERVER_BUNDLE_DIRECTORY).toSorted(
        (firstFile, secondFile) => secondFile.bytes - firstFile.bytes,
      );
      const totalBytes = files.reduce((total, { bytes }) => total + bytes, 0);
      console.info(
        `${bundleName}: ${toMebibytes(totalBytes)} MiB in ${files.length} files, against the ${toMebibytes(WORKER_CODE_LIMIT_BYTES)} MiB Worker code limit`,
      );
      console.info(`The ${SERVER_BUNDLE_REPORTED_FILE_COUNT} largest:`);
      for (const { bytes, file } of files.slice(0, SERVER_BUNDLE_REPORTED_FILE_COUNT))
        console.info(`  ${toMebibytes(bytes).padStart(6)} MiB  ${file}`);

      if (totalBytes > WORKER_CODE_LIMIT_BYTES)
        throw new InvalidOperationError(
          Operation.Read,
          bundleName,
          `it is ${toMebibytes(totalBytes)} MiB, over the ${toMebibytes(WORKER_CODE_LIMIT_BYTES)} MiB Worker code limit`,
        );
    },
  }),
);
