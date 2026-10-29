import type { RecordPathsOutcome } from "#src/models/genshinParity/reference/RecordPathsOutcome";
import type { ReferenceObjectTarget } from "#src/models/genshinParity/reference/ReferenceObjectTarget";

import { REFERENCE_PACK_CONCURRENCY } from "#src/services/genshinParity/reference/constants";
import { getObjectBlobName } from "#src/services/genshinParity/reference/getObjectBlobName";
import { getRecordPath } from "#src/services/genshinParity/reference/getRecordPath";
import { packPathObject } from "#src/services/genshinParity/reference/packPathObject";
import { putReferenceObject } from "#src/services/genshinParity/reference/putReferenceObject";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { writeManifestFile } from "#src/services/genshinParity/reference/writeManifestFile";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { isAbsolute, relative, resolve, sep } from "node:path";

// Stores the record files named on the command line, each streamed from its own path and uploaded to the accounts that lack
// It, then records each in the manifest's records section under its path relative to the parity folder, which a restore
// Writes it back to
export const packRecordPaths = async (
  paths: string[],
  isDryRun: boolean,
  targets: ReferenceObjectTarget[],
): Promise<RecordPathsOutcome> => {
  const files = await settleAll(
    paths.map((path) => async () => {
      const absolutePath = resolve(path);
      const relativePath = relative(PARITY_DIRECTORY, absolutePath);
      const climbsOut = relativePath === ".." || relativePath.startsWith(`..${sep}`);
      if (isAbsolute(relativePath) || climbsOut)
        throw new InvalidOperationError(
          Operation.Read,
          path,
          "is outside the parity folder, so a record has no place to restore it to",
        );
      const { bytes, extension, sha256 } = await packPathObject(absolutePath);
      const uploads = isDryRun
        ? 0
        : await putReferenceObject(getObjectBlobName(sha256, extension), absolutePath, targets);
      return { bytes, extension, path: getRecordPath(relativePath), sha256, uploads };
    }),
    REFERENCE_PACK_CONCURRENCY,
  );
  // Two files packed under one path would be two rows the manifest's uniqueness check refuses on every later read, so the pack stops here
  const recordPaths = files.map(({ path }) => path);
  const duplicatePath = recordPaths.find((recordPath, index) => recordPaths.indexOf(recordPath) !== index);
  if (duplicatePath !== undefined)
    throw new InvalidOperationError(
      Operation.Create,
      duplicatePath,
      "is named by two of the files packed, and the manifest names each one once",
    );
  if (!isDryRun) {
    const manifest = await readManifestFile();
    const names = new Set(recordPaths);
    await writeManifestFile({
      ...manifest,
      records: [
        ...manifest.records.filter(({ path }) => !names.has(path)),
        ...files.map(({ bytes, extension, path, sha256 }) => ({ bytes, path, sha256, sourceFormat: extension })),
      ],
    });
  }
  return {
    packed: files.map(({ bytes, path }) => ({ bytes, path })),
    uploads: files.reduce((total, { uploads }) => total + uploads, 0),
  };
};
