import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

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
  "reference's view, and over the sky: its share of the frame, the CIELab distance between its mean colour and the",
  "reference's, and its tone and FLIP, so a family drawn away from the reference shows on its own row.",
  "",
  "| Layer | Coverage | Colour | Tone | FLIP |",
  "| :---- | -------: | -----: | ---: | ---: |",
];
// A row of either table, keyed in its first cell by its reference's id, and a layer's by that id and its name after a
// Slash
const ROW_REGEX = /^\| `(?<key>[^`]+)` \|/u;
const LAYER_SEPARATOR = "/";
const toRow = (referenceId: string, { edgeScore, flip, meanDifference, screen, toneDifference }: ParityScore): string =>
  `| \`${referenceId}\` | \`${screen}\` | ${meanDifference.toFixed(2)}% | ${edgeScore.toFixed(3)} | ${toneDifference.toFixed(2)}% | ${flip.toFixed(4)} |`;
const toLayerRow = (key: string, { colour, coverage, flip, tone }: LayerScore): string =>
  `| \`${key}\` | ${(coverage * 100).toFixed(1)}% | ${colour.toFixed(2)} | ${tone.toFixed(2)}% | ${flip.toFixed(4)} |`;
// The report of every reference's scores and its scene's layers from the report's lines as they were, the given ones
// Rewritten and the rest kept as they were last scored, in the references' order, a reference not among them dropped
// With its layers
export const mergeParityScores = (
  lines: readonly string[],
  scores: Readonly<Record<string, ParityScore>>,
  referenceIds: readonly string[],
): string => {
  const rowMap = new Map(
    lines.flatMap((line) => {
      const key = ROW_REGEX.exec(line)?.groups?.key;
      return key ? [[key, line] as const] : [];
    }),
  );
  for (const [referenceId, score] of Object.entries(scores)) {
    rowMap.set(referenceId, toRow(referenceId, score));
    // A reference scored again replaces every layer row it had, so a family it no longer draws leaves none behind
    for (const key of rowMap.keys()) if (key.startsWith(`${referenceId}${LAYER_SEPARATOR}`)) rowMap.delete(key);
    for (const layer of score.layers) {
      const key = `${referenceId}${LAYER_SEPARATOR}${layer.name}`;
      rowMap.set(key, toLayerRow(key, layer));
    }
  }
  const rows = referenceIds.flatMap((referenceId) => {
    const row = rowMap.get(referenceId);
    return row ? [row] : [];
  });
  const layerRows = referenceIds.flatMap((referenceId) =>
    [...rowMap].flatMap(([key, row]) => (key.startsWith(`${referenceId}${LAYER_SEPARATOR}`) ? [row] : [])),
  );
  const layerLines = layerRows.length > 0 ? [...LAYER_HEADER, ...layerRows] : [];
  return `${[...HEADER, ...rows, ...layerLines].join("\n")}\n`;
};
