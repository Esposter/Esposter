import type { ReferenceObjectTarget } from "#src/models/genshinParity/reference/ReferenceObjectTarget";
import type { ReferencePathsOutcome } from "#src/models/genshinParity/reference/ReferencePathsOutcome";

import { ReferencePackKind } from "#src/models/genshinParity/reference/ReferencePackKind";
import { REFERENCE_PACK_CONCURRENCY, USER_RECORDING_SOURCE } from "#src/services/genshinParity/reference/constants";
import { getObjectBlobName } from "#src/services/genshinParity/reference/getObjectBlobName";
import { getRecordPath } from "#src/services/genshinParity/reference/getRecordPath";
import { packPathObject } from "#src/services/genshinParity/reference/packPathObject";
import { putReferenceObject } from "#src/services/genshinParity/reference/putReferenceObject";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { writeManifestFile } from "#src/services/genshinParity/reference/writeManifestFile";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";

// Stores the files a recording or record pack names, each streamed from its own path and uploaded to the accounts that lack
// It, then records each in its manifest section. A record's path is kept relative to the parity folder it is restored into
export const packManifestPaths = async (
  kind: ReferencePackKind,
  paths: string[],
  isDryRun: boolean,
  targets: ReferenceObjectTarget[],
): Promise<ReferencePathsOutcome> => {
  const files = await settleAll(
    paths.map((path) => async () => {
      const absolutePath = resolve(path);
      const relativePath = relative(PARITY_DIRECTORY, absolutePath);
      const climbsOut = relativePath === ".." || relativePath.startsWith(`..${sep}`);
      if (kind === ReferencePackKind.Record && (isAbsolute(relativePath) || climbsOut))
        throw new InvalidOperationError(
          Operation.Read,
          path,
          "is outside the parity folder, so a record has no place to restore it to",
        );
      const { bytes, extension, sha256 } = await packPathObject(absolutePath);
      const uploads = isDryRun
        ? 0
        : await putReferenceObject(getObjectBlobName(sha256, extension), absolutePath, targets);
      return { bytes, extension, name: basename(absolutePath), path: getRecordPath(relativePath), sha256, uploads };
    }),
    REFERENCE_PACK_CONCURRENCY,
  );
  // Two files named alike would be two rows the manifest's uniqueness check refuses on every later read, so the pack stops here
  const keys = files.map(({ name, path }) => (kind === ReferencePackKind.Record ? path : name));
  const duplicateKey = keys.find((key, index) => keys.indexOf(key) !== index);
  if (duplicateKey !== undefined)
    throw new InvalidOperationError(
      Operation.Create,
      duplicateKey,
      "is named by two of the files packed, and the manifest names each one once",
    );
  if (!isDryRun) {
    const manifest = await readManifestFile();
    if (kind === ReferencePackKind.Record) {
      const names = new Set(files.map(({ path }) => path));
      await writeManifestFile({
        ...manifest,
        records: [
          ...manifest.records.filter(({ path }) => !names.has(path)),
          ...files.map(({ bytes, extension, path, sha256 }) => ({ bytes, path, sha256, sourceFormat: extension })),
        ],
      });
    } else {
      const names = new Set(files.map(({ name }) => name));
      await writeManifestFile({
        ...manifest,
        recordings: [
          ...manifest.recordings.filter(({ name }) => !names.has(name)),
          ...files.map(({ bytes, extension, name, sha256 }) => {
            // A row a clip wrote keeps its url and range, so a pack of the same file does not lose where it came from
            const committedRow = manifest.recordings.find((row) => row.name === name);
            return {
              attribution: committedRow?.attribution ?? {},
              bytes,
              name,
              ...(committedRow?.range === undefined ? {} : { range: committedRow.range }),
              sha256,
              source: committedRow?.source ?? USER_RECORDING_SOURCE,
              sourceFormat: extension,
            };
          }),
        ],
      });
    }
  }
  return {
    packed: files.map(({ bytes, name, path }) => ({ bytes, name: kind === ReferencePackKind.Record ? path : name })),
    uploads: files.reduce((total, { uploads }) => total + uploads, 0),
  };
};
