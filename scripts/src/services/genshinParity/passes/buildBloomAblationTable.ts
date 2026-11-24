import type { BloomAblationRow } from "#src/models/genshinParity/passes/BloomAblationRow";
import type { BloomResize } from "#src/models/genshinParity/passes/BloomResize";
import type { GameBloomStructure } from "genshin-engine";

import { BloomResize as Resize } from "#src/models/genshinParity/passes/BloomResize";
import { BLOOM_READING_GATE } from "#src/services/genshinParity/passes/constants";

const PREFILTER_LABELS: Record<GameBloomStructure["prefilter"], string> = { fourTap: "four taps", oneTap: "one tap" };
const MEASUREMENT_LABELS: Record<BloomResize, string> = {
  [Resize.Display]: "display width",
  [Resize.Source]: "reference's width, resized",
};
const formatReading = (value: number): string => (Number.isFinite(value) ? value.toFixed(4) : "none");
// A structure holds the gate when every reference reads strictly below it, and a reference with no reading holds
// Nothing
const checkIsHeld = (values: number[]): boolean => values.every((value) => value < BLOOM_READING_GATE);

// The ablation as a Markdown table: one row a structure at a measurement, its reading over each reference in ΔE and
// Their mean, and whether it holds the bloom's gate (`BLOOM_READING_GATE`)
export const buildBloomAblationTable = (rows: BloomAblationRow[]): string => {
  const referenceIds = [...new Set(rows.flatMap(({ readings }) => Object.keys(readings)))];
  const header = ["Prefilter", "Tap offset", "Blur", "Measured at", ...referenceIds, "Mean", "Holds"];
  const body = rows.map(({ measurement, readings, structure }) => {
    const values = referenceIds.map((referenceId) => readings[referenceId] ?? Infinity);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return [
      PREFILTER_LABELS[structure.prefilter],
      structure.tapOffset.toFixed(1),
      `${structure.blurForm} ×${structure.blurPasses}`,
      MEASUREMENT_LABELS[measurement],
      ...values.map((value) => formatReading(value)),
      formatReading(mean),
      checkIsHeld(values) ? "yes" : "no",
    ];
  });
  return [header, header.map(() => "---"), ...body].map((cells) => `| ${cells.join(" | ")} |`).join("\n");
};
