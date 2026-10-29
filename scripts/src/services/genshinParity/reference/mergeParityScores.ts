import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { PARITY_SCORES_FORMAT_PATH } from "#src/services/genshinParity/reference/constants";
import { toLayerRow } from "#src/services/genshinParity/reference/toLayerRow";
import { toPendingRow } from "#src/services/genshinParity/reference/toPendingRow";
import { toRow } from "#src/services/genshinParity/reference/toRow";
import { formatText } from "#src/services/shared/formatText";
import { takeOne } from "@esposter/shared";

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
const LAYER_SEPARATOR = "/";

// A row's cells: the text between its outer pipes, split on the pipes a cell does not escape, each cell trimmed, so the
// Formatter's padding never changes what a cell holds
const splitCells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\||\|$/gu, "")
    .split(/(?<!\\)\|/u)
    .map((cell) => cell.trim());
// A row of either table, keyed in its first cell by its reference's id, and a layer's by that id and its name after a
// Slash. A line that is not a row has no key
const readRowKey = (line: string): string | undefined =>
  line.trim().startsWith("|") ? /^`(?<key>[^`]+)`$/u.exec(takeOne(splitCells(line), 0))?.groups?.key : undefined;

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
// Use. A scored reference's row and layers are rewritten, a full run writes a pending screen's row with its reason and no
// Layers, and every other row is kept as it was. A subset run lists the rows in the report's own order, a new reference placed in the
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
      const key = readRowKey(line);
      return key ? [[key, line] as const] : [];
    }),
  );
  const isFullRun = run === ParityReportRun.Full;
  const checkIsPending = (referenceId: string): boolean => references[referenceId]?.pending !== undefined;
  // A pending screen's row is the map's own statement, so only the full run writes it, and a subset run leaves it as it was
  const order = isFullRun
    ? referenceIds.filter(
        (referenceId) => scores[referenceId] !== undefined || checkIsPending(referenceId) || rowMap.has(referenceId),
      )
    : placeNewIds(
        [...rowMap.keys()].filter((key) => !key.includes(LAYER_SEPARATOR)),
        referenceIds.filter((referenceId) => scores[referenceId] !== undefined && !rowMap.has(referenceId)),
        referenceIds,
      );
  const rows = order.flatMap((referenceId) => {
    const reference = references[referenceId];
    if (isFullRun && reference?.pending !== undefined)
      return [toPendingRow(referenceId, reference.screen, reference.pending)];
    const score = scores[referenceId];
    if (score) return [toRow(referenceId, score)];
    const row = rowMap.get(referenceId);
    return row ? [row] : [];
  });
  // A reference scored again replaces every layer row it had, so a family it no longer draws leaves none behind
  const layerRows = order.flatMap((referenceId) => {
    const score = scores[referenceId];
    if (score) return score.layers.map((layer) => toLayerRow(`${referenceId}${LAYER_SEPARATOR}${layer.name}`, layer));
    if (isFullRun && checkIsPending(referenceId)) return [];
    return [...rowMap].flatMap(([key, line]) => (key.startsWith(`${referenceId}${LAYER_SEPARATOR}`) ? [line] : []));
  });
  const layerLines = layerRows.length > 0 ? [...LAYER_HEADER, ...layerRows] : [];
  // The text the formatter commits for this report, so a write formats to itself and a diff shows only the rows that moved
  return formatText(PARITY_SCORES_FORMAT_PATH, `${[...HEADER, ...rows, ...layerLines].join("\n")}\n`);
};
