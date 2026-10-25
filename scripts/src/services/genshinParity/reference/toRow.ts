import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

export const toRow = (
  referenceId: string,
  { edgeScore, flip, meanDifference, screen, toneDifference }: ParityScore,
): string =>
  `| \`${referenceId}\` | \`${screen}\` | ${meanDifference.toFixed(2)}% | ${edgeScore.toFixed(3)} | ${toneDifference.toFixed(2)}% | ${flip.toFixed(4)} |`;
