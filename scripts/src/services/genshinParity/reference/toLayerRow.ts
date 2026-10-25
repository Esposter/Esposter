import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";

export const toLayerRow = (key: string, { colour, coverage, flip, tone }: LayerScore): string =>
  `| \`${key}\` | ${(coverage * 100).toFixed(1)}% | ${colour.toFixed(2)} | ${tone.toFixed(2)}% | ${flip.toFixed(4)} |`;
