import type { ParityScore } from "#src/models/genshinParity/ParityScore";

import { PARITY_SCORES_PATH } from "#src/services/genshinParity/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const HEADER = [
  "# Parity scores",
  "",
  "Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them",
  "all). The mean difference and the tone run from 0 (identical) up; the shape is the share of the reference's edges",
  "the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is committed.",
  "",
  "| Reference | Screen | Mean difference | Shape | Tone |",
  "| :-------- | :----- | --------------: | ----: | ---: |",
];
// A row of the report, keyed by its reference's id in the first cell
const ROW_REGEX = /^\| `(?<referenceId>[^`]+)` \|/u;
const toRow = (referenceId: string, { edgeScore, meanDifference, screen, toneDifference }: ParityScore): string =>
  `| \`${referenceId}\` | \`${screen}\` | ${meanDifference.toFixed(2)}% | ${edgeScore.toFixed(3)} | ${toneDifference.toFixed(2)}% |`;
// The committed report of every reference's scores, the given ones rewritten and the rest kept as they were last
// Scored, in the map's order, a reference the map no longer names dropped
export const writeParityScores = async (scores: Readonly<Record<string, ParityScore>>): Promise<void> => {
  const lines = existsSync(PARITY_SCORES_PATH) ? (await readFile(PARITY_SCORES_PATH, "utf8")).split("\n") : [];
  const rowMap = new Map(
    lines.flatMap((line) => {
      const referenceId = ROW_REGEX.exec(line)?.groups?.referenceId;
      return referenceId ? [[referenceId, line] as const] : [];
    }),
  );
  for (const [referenceId, score] of Object.entries(scores)) rowMap.set(referenceId, toRow(referenceId, score));
  const rows = Object.keys(ParityReferenceMap).flatMap((referenceId) => {
    const row = rowMap.get(referenceId);
    return row ? [row] : [];
  });
  await writeFile(PARITY_SCORES_PATH, `${[...HEADER, ...rows].join("\n")}\n`);
};
