import type { ReferencePackOutcome } from "#src/models/genshinParity/reference/ReferencePackOutcome";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { REFERENCE_PACK_LARGEST_COUNT } from "#src/services/genshinParity/reference/constants";
import { formatEntryPaths } from "#src/services/genshinParity/reference/formatEntryPaths";
import { formatMebibytes } from "#src/services/genshinParity/reference/formatMebibytes";
import { sumOf } from "#src/services/genshinParity/reference/sumOf";

const KINDS = [ParityReferenceKind.Wiki, ParityReferenceKind.RecordingFrame, ParityReferenceKind.Other];

// The table `references pack` prints: the counts, the sizes by kind, and the largest files packed.
// It also names the ids refused for a missing input, the files restored from scratch, and those with no screenshot.
// The ids whose rows were replaced are named too, as are the scratch screenshots no entry names, left in place
export const formatPackTable = ({
  held,
  missing,
  packed,
  refused,
  replaced,
  restored,
  unnamed,
  written,
}: ReferencePackOutcome): string => {
  const kindRows = KINDS.map((kind) => {
    const files = packed.filter((file) => file.kind === kind);
    const row = [
      kind.padEnd(18),
      String(files.length).padStart(6),
      formatMebibytes(sumOf(files.map(({ bytesBefore }) => bytesBefore))).padStart(12),
      formatMebibytes(sumOf(files.map(({ bytesAfter }) => bytesAfter))).padStart(12),
    ];
    return row.join(" ");
  });
  const largest = packed
    .toSorted((firstPackFile, secondPackFile) => secondPackFile.bytesAfter - firstPackFile.bytesAfter)
    .slice(0, REFERENCE_PACK_LARGEST_COUNT)
    .map(
      ({ bytesAfter, bytesBefore, file }) =>
        `  ${file.padEnd(40)}${formatMebibytes(bytesBefore).padStart(12)}${formatMebibytes(bytesAfter).padStart(12)}`,
    );
  return [
    `files    ${packed.length} packed, ${held.length} already committed, ${restored.length} restored, ${missing.length} with no screenshot here`,
    `written  ${written} files in the repository`,
    `refused  ${formatEntryPaths(refused)}`,
    `kind               files        before         after`,
    ...kindRows,
    `largest ${REFERENCE_PACK_LARGEST_COUNT} after the pack`,
    ...largest,
    `replaced ${replaced.toSorted().join(", ") || "none"}`,
    `restored ${formatEntryPaths(restored)}`,
    `missing  ${formatEntryPaths(missing)}`,
    `unnamed  ${unnamed.count} scratch screenshots no entry names, left in place, ${formatMebibytes(unnamed.bytes)}`,
  ].join("\n");
};
