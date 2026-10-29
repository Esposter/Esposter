import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { toLayerRow } from "#src/services/genshinParity/reference/toLayerRow";
import { toPendingRow } from "#src/services/genshinParity/reference/toPendingRow";
import { toRow } from "#src/services/genshinParity/reference/toRow";

const HEADER = [
  "# Parity scores",
  "",
  "Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them",
  "all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of",
  "the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is",
  "committed.",
  "",
  "| Reference | Screen | Mean difference | Shape | Tone | FLIP |",
  "| :-------- | :----- | --------------: | ----: | ---: | ---: |",
];
const LAYER_HEADER = [
  "",
  "## Layers",
  "",
  "Each scene's shot scored again over each family of its parts, as the witness's part target lays them at the",
  "reference's view, and over the sky, within the region its row above scores, so its frame is that row: its share of",
  "the region, the CIELab distance between its mean colour and the reference's, and its tone and FLIP, so a family",
  "drawn away from the reference shows on its own row.",
  "",
  "| Layer | Coverage | Colour | Tone | FLIP |",
  "| :---- | -------: | -----: | ---: | ---: |",
];
// A row of either table, keyed in its first cell by its reference's id, and a layer's by that id and its name after a
// Slash
const ROW_REGEX = /^\| `(?<key>[^`]+)` \|/u;
const LAYER_SEPARATOR = "/";

// Each new id goes after the nearest id before it in the references' order that the report already lists, so it lands
// Where a full run would put it
const placeNewIds = (ids: readonly string[], newIds: readonly string[], referenceIds: readonly string[]): string[] =>
  newIds.reduce(
    (order, newId) => {
      const predecessor = referenceIds.slice(0, referenceIds.indexOf(newId)).findLast((id) => order.includes(id));
      return order.toSpliced(predecessor === undefined ? 0 : order.indexOf(predecessor) + 1, 0, newId);
    },
    [...ids],
  );

// The report merged from its lines as they were and the given scores, the one merge both writers (`compare` and `approve`)
// Use. A scored reference's row and layers are rewritten, a pending screen's row names its reason and has no layers, and
// Every other row is kept as it was. A subset run lists the rows in the report's own order, a new reference placed in the
// References' order; a full run lists every reference in the references' order and drops the rows of a reference the map
// No longer holds
export const mergeParityScores = (
  lines: readonly string[],
  scores: Readonly<Record<string, ParityScore>>,
  referenceIds: readonly string[],
  references: Readonly<Record<string, ParityReference>>,
  run: ParityReportRun,
): string => {
  const rowMap = new Map(
    lines.flatMap((line) => {
      const key = ROW_REGEX.exec(line)?.groups?.key;
      return key ? [[key, line] as const] : [];
    }),
  );
  const isPending = (referenceId: string): boolean => references[referenceId]?.pending !== undefined;
  const isWritten = (referenceId: string): boolean => scores[referenceId] !== undefined || isPending(referenceId);
  const order =
    run === ParityReportRun.Full
      ? referenceIds.filter((referenceId) => isWritten(referenceId) || rowMap.has(referenceId))
      : placeNewIds(
          [...rowMap.keys()].filter((key) => !key.includes(LAYER_SEPARATOR)),
          referenceIds.filter((referenceId) => isWritten(referenceId) && !rowMap.has(referenceId)),
          referenceIds,
        );
  const rows = order.flatMap((referenceId) => {
    const reference = references[referenceId];
    if (reference?.pending !== undefined) return [toPendingRow(referenceId, reference.screen, reference.pending)];
    const score = scores[referenceId];
    if (score) return [toRow(referenceId, score)];
    const row = rowMap.get(referenceId);
    return row ? [row] : [];
  });
  // A reference scored again replaces every layer row it had, so a family it no longer draws leaves none behind
  const layerRows = order.flatMap((referenceId) => {
    if (isPending(referenceId)) return [];
    const score = scores[referenceId];
    if (score) return score.layers.map((layer) => toLayerRow(`${referenceId}${LAYER_SEPARATOR}${layer.name}`, layer));
    return [...rowMap].flatMap(([key, line]) => (key.startsWith(`${referenceId}${LAYER_SEPARATOR}`) ? [line] : []));
  });
  const layerLines = layerRows.length > 0 ? [...LAYER_HEADER, ...layerRows] : [];
  return `${[...HEADER, ...rows, ...layerLines].join("\n")}\n`;
};
