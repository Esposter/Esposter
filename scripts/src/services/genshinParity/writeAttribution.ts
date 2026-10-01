import type { AttributionRow } from "#src/models/genshinParity/AttributionRow";

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// The committed report of every scene's loss table, beside the parity scores
const ATTRIBUTION_PATH = join(import.meta.dirname, "ParityAttribution.snapshot.md");
const HEADER = [
  "# Loss tables",
  "",
  "Every scene's last `pnpm -C scripts genshin:parity attribute`, one section per set of references, which it",
  "rewrites. A row is a view of the witness render scored against the references on one layer, the frame or the pixels",
  "the witness's part target gives a family or the sky: its share of the frame, the shape (1 identical), the tone, the",
  "detail and FLIP's perceptual error (0 identical). Its loss is how far its FLIP falls from the witness's own on that",
  "layer, the cost of that stand-in there. Commit it with the change that moved it, as a bench's report is.",
].join("\n");
// A set of references' loss table as its section of the committed report, beside every other set's
export const writeAttribution = async (
  referenceIds: readonly string[],
  rows: readonly AttributionRow[],
): Promise<string> => {
  const title = `## ${referenceIds.map((id) => `\`${id}\``).join(", ")}`;
  const witnessLayerMap = new Map(rows[0]?.layers.map((layer) => [layer.name, layer]));
  const lines = [
    title,
    "",
    "| View | Layer | Share | Shape | Tone | Detail | FLIP | Loss |",
    "| :--- | :---- | ----: | ----: | ---: | -----: | ---: | ---: |",
    ...rows.flatMap(({ layers, name }) =>
      layers.map(({ coverage, detail, flip, name: layer, shape, tone }) => {
        const loss = flip - (witnessLayerMap.get(layer)?.flip ?? flip);
        return `| ${name} | ${layer} | ${(coverage * 100).toFixed(1)}% | ${shape.toFixed(3)} | ${tone.toFixed(2)}% | ${detail.toFixed(2)}% | ${flip.toFixed(4)} | ${loss.toFixed(4)} |`;
      }),
    ),
  ];
  const report = existsSync(ATTRIBUTION_PATH) ? await readFile(ATTRIBUTION_PATH, "utf8") : HEADER;
  const sections = report.split(/\n(?=## )/u);
  const index = sections.findIndex((section) => section.startsWith(title));
  const section = lines.join("\n");
  if (index === -1) sections.push(section);
  else sections[index] = section;
  await writeFile(ATTRIBUTION_PATH, `${sections.map((part) => part.trimEnd()).join("\n\n")}\n`);
  return ATTRIBUTION_PATH;
};
