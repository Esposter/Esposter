import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { sortObjectKeys } from "#src/services/genshinParity/reference/sortObjectKeys";

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
      records.toSorted((first, second) => (first.path < second.path ? -1 : 1)),
    ),
    formatSection(
      "recordings",
      recordings.toSorted((first, second) => (first.name < second.name ? -1 : 1)),
    ),
    formatSection(
      "references",
      references.toSorted((first, second) => (first.id < second.id ? -1 : 1)),
    ),
  ];
  return `{\n${[...header, ...sections].join(",\n")}\n}\n`;
};
