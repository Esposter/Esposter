import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupOptions } from "#src/models/setup/SetupOptions";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { getRecordDestination } from "#src/services/genshinParity/reference/getRecordDestination";
import { parseReferenceManifest } from "#src/services/genshinParity/reference/parseReferenceManifest";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { REFERENCES_RESTORE_ARGS, REFERENCES_RESTORE_COMMAND } from "#src/services/setup/constants";
import { getRunRow } from "#src/services/setup/getRunRow";
import { getStepRow } from "#src/services/setup/getStepRow";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";

// The parity records the manifest names are in place when each is in the parity folder. The references are committed, so
// a clone holds them and they are not this row's to check: the committed references test checks their hashes. A missing
// record is what the restore closes, so --install runs it and otherwise the row names it. The check is presence alone
export const readReferencesRow = (options: SetupOptions, environment: SetupEnvironment): SetupRow => {
  const step = "parity records";
  const manifest = parseReferenceManifest(environment.readText(REFERENCE_MANIFEST_PATH));
  if (manifest.records.every(({ path }) => environment.exists(getRecordDestination(path))))
    return getStepRow(step, true, "");
  if (!options.install) return getStepRow(step, false, REFERENCES_RESTORE_COMMAND);
  const { status } = environment.runVisibly(PNPM_FILE, [...PNPM_ARGS, ...REFERENCES_RESTORE_ARGS]);
  return getRunRow(step, status, `${REFERENCES_RESTORE_COMMAND} failed: run it to read its error`);
};
