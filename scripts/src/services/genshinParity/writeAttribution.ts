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
  "rewrites. A row is a view of the witness render scored against the references: the line distance (pixels between",
  "the towers' sides, 0 identical), the shape (1 identical), the tone and the detail (0 identical). Its loss is how far",
  "it falls from the witness's own row, the cost of that stand-in. Commit it with the change that moved it, as a",
  "bench's report is.",
].join("\n");
// A set of references' loss table as its section of the committed report, beside every other set's
export const writeAttribution = async (
  referenceIds: readonly string[],
  rows: readonly AttributionRow[],
): Promise<string> => {
  const title = `## ${referenceIds.map((id) => `\`${id}\``).join(", ")}`;
  const [witness] = rows;
  const lines = [
    title,
    "",
    "| View | Line distance | Shape | Tone | Detail | Loss: line, shape, tone, detail |",
    "| :--- | ------------: | ----: | ---: | -----: | :------------------------------ |",
    ...rows.map(({ detail, lineDistance, name, shape, tone }) => {
      const loss = witness
        ? [
            (lineDistance - witness.lineDistance).toFixed(2),
            (witness.shape - shape).toFixed(3),
            (tone - witness.tone).toFixed(2),
            (detail - witness.detail).toFixed(2),
          ].join(", ")
        : "";
      return `| ${name} | ${lineDistance.toFixed(2)} | ${shape.toFixed(3)} | ${tone.toFixed(2)}% | ${detail.toFixed(2)}% | ${loss} |`;
    }),
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
