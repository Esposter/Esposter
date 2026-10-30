import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { sortObjectKeys } from "#src/services/genshinParity/reference/sortObjectKeys";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { compareCodeUnits } from "#src/services/shared/compareCodeUnits";
import { formatJsonFile } from "#src/services/shared/formatJsonFile";

// The manifest as the formatter commits it: each section's rows sorted by their name and each row's keys in code point
// Order, so two machines' additions land as the same lines. A header key the manifest does not hold is left out, never
// Written as a guess. The formatter, not this function, decides where a row breaks, so a re-run formats to the same text
export const formatManifestFile = ({
  animeGameDataCommit,
  gameVersion,
  records,
  recordings,
  references,
}: ParityReferenceManifest): string =>
  formatJsonFile(REFERENCE_MANIFEST_PATH, {
    animeGameDataCommit,
    gameVersion,
    records: records
      .toSorted((firstRecord, secondRecord) => compareCodeUnits(firstRecord.path, secondRecord.path))
      .map((row) => sortObjectKeys(row)),
    recordings: recordings
      .toSorted((firstRecording, secondRecording) => compareCodeUnits(firstRecording.name, secondRecording.name))
      .map((row) => sortObjectKeys(row)),
    references: references
      .toSorted((firstReference, secondReference) => compareCodeUnits(firstReference.id, secondReference.id))
      .map((row) => sortObjectKeys(row)),
  });
