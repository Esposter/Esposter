import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { sortObjectKeys } from "#src/services/genshinParity/reference/sortObjectKeys";
import { compareCodeUnits } from "#src/services/shared/compareCodeUnits";

// One section as its JSON: a row per line, each with its keys sorted, so two machines' additions land as separate lines
const formatSection = (name: string, rows: unknown[]): string =>
  rows.length === 0
    ? `  ${JSON.stringify(name)}: []`
    : `  ${JSON.stringify(name)}: [\n${rows.map((row) => `    ${JSON.stringify(sortObjectKeys(row))}`).join(",\n")}\n  ]`;

// The manifest as text: its header keys in code point order, then each section with its rows in key order. A header key
// the manifest does not hold is left out, never written as a guess
export const formatManifestFile = ({
  animeGameDataCommit,
  gameVersion,
  records,
  recordings,
  references,
}: ParityReferenceManifest): string => {
  const header = [
    ...(animeGameDataCommit === undefined ? [] : [`  "animeGameDataCommit": ${JSON.stringify(animeGameDataCommit)}`]),
    ...(gameVersion === undefined ? [] : [`  "gameVersion": ${JSON.stringify(gameVersion)}`]),
  ];
  const sections = [
    formatSection(
      "records",
      records.toSorted((first, second) => compareCodeUnits(first.path, second.path)),
    ),
    formatSection(
      "recordings",
      recordings.toSorted((first, second) => compareCodeUnits(first.name, second.name)),
    ),
    formatSection(
      "references",
      references.toSorted((first, second) => compareCodeUnits(first.id, second.id)),
    ),
  ];
  return `{\n${[...header, ...sections].join(",\n")}\n}\n`;
};
