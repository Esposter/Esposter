import type { ReferencePackOutcome } from "#src/models/genshinParity/reference/ReferencePackOutcome";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { REFERENCE_PACK_LARGEST_COUNT } from "#src/services/genshinParity/reference/constants";
import { formatMebibytes } from "#src/services/genshinParity/reference/formatMebibytes";

const KINDS = [ParityReferenceKind.Wiki, ParityReferenceKind.RecordingFrame, ParityReferenceKind.Other];

const sumOf = (values: number[]): number => values.reduce((total, value) => total + value, 0);

// The table `references pack` prints: the counts, the sizes by kind, the largest files packed, the ids whose rows were
// replaced, the files with no screenshot, and the scratch screenshots no entry names, left in place
export const formatPackTable = ({
  held,
  missing,
  packed,
  replaced,
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
    .toSorted((first, second) => second.bytesAfter - first.bytesAfter)
    .slice(0, REFERENCE_PACK_LARGEST_COUNT)
    .map(
      ({ bytesAfter, bytesBefore, file }) =>
        `  ${file.padEnd(40)}${formatMebibytes(bytesBefore).padStart(12)}${formatMebibytes(bytesAfter).padStart(12)}`,
    );
  return [
    `files    ${packed.length} packed, ${held.length} already committed, ${missing.length} with no screenshot here`,
    `written  ${written} files in the repository`,
    `kind               files        before         after`,
    ...kindRows,
    `largest ${REFERENCE_PACK_LARGEST_COUNT} after the pack`,
    ...largest,
    `replaced ${replaced.toSorted().join(", ") || "none"}`,
    `missing  ${missing.toSorted().join(", ") || "none"}`,
    `unnamed  ${unnamed.count} scratch screenshots no entry names, left in place, ${formatMebibytes(unnamed.bytes)}`,
  ].join("\n");
};
