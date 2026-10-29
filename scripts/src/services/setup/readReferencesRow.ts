import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupOptions } from "#src/models/setup/SetupOptions";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { getCachedReferencePath } from "#src/services/genshinParity/reference/getCachedReferencePath";
import { getRecordDestination } from "#src/services/genshinParity/reference/getRecordDestination";
import { listReferenceImages } from "#src/services/genshinParity/reference/listReferenceImages";
import { parseReferenceManifest } from "#src/services/genshinParity/reference/parseReferenceManifest";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { REFERENCES_RESTORE_ARGS, REFERENCES_RESTORE_COMMAND } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";

// The parity references the manifest names are in place when each record is in the parity folder and each stored image is in
// the download cache, where the restore writes them. A missing one is what the restore closes, so --install runs it and
// otherwise the row names it. The check is presence alone: the restore is the command that checks each file's hash
export const readReferencesRow = (options: SetupOptions, environment: SetupEnvironment): SetupRow => {
  const step = "parity references";
  const manifest = parseReferenceManifest(environment.readText(REFERENCE_MANIFEST_PATH));
  const restoredPaths = [
    ...manifest.records.map(({ path }) => getRecordDestination(path)),
    ...manifest.references.flatMap(listReferenceImages).map(({ sha256 }) => getCachedReferencePath(sha256)),
  ];
  if (restoredPaths.every((path) => environment.exists(path))) return getStepRow(step, true, "");
  if (!options.install) return getStepRow(step, false, REFERENCES_RESTORE_COMMAND);
  const { status } = environment.runVisibly(PNPM_FILE, [...PNPM_ARGS, ...REFERENCES_RESTORE_ARGS]);
  return status === 0
    ? { next: "", status: SetupStatus.Done, step }
    : getStepRow(step, false, `${REFERENCES_RESTORE_COMMAND} failed: run it to read its error`);
};
