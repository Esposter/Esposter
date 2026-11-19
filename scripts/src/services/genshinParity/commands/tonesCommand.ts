/* oxlint-disable no-await-in-loop -- One device: one browser is open at a time, and each reference's frame is shot before the next opens */
import type { BrightnessBandReading } from "#src/models/genshinParity/passes/BrightnessBandReading";
import type { SubCommandsDef } from "citty";

import { getBloomReferenceIds } from "#src/services/genshinParity/passes/getBloomReferenceIds";
import { readBrightnessBands } from "#src/services/genshinParity/passes/readBrightnessBands";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { defineCommand } from "citty";

// Formats a band's mean error to two decimals, or a dash where the band holds no pixel
const formatError = (error: number | undefined): string => (error === undefined ? "-" : error.toFixed(2));

// The brightness bands of every reference whose screen draws the bloom, with the bloom drawn off: where our frame reads
// brighter or darker than the reference, by band. Its last line is the rows as JSON
export const tonesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Read each login reference's lightness error by brightness band (shadows, mids, highlights, above the bloom threshold) with the bloom drawn off, and print the table",
    name: "tones",
  },
  run: async () => {
    const rows: { readings: BrightnessBandReading[]; referenceId: string }[] = [];
    for (const referenceId of getBloomReferenceIds(Object.keys(ParityReferenceMap)))
      rows.push({ readings: await readBrightnessBands(referenceId), referenceId });
    console.log("| Reference | Band | Pixels | Mean ΔL* (ours - reference) | Mean abs ΔL* |");
    console.log("| :-------- | :--- | -----: | --------------------------: | -----------: |");
    for (const { readings, referenceId } of rows)
      for (const { band, meanAbsoluteError, meanSignedError, pixels } of readings)
        console.log(
          `| ${referenceId} | ${band} | ${pixels} | ${formatError(meanSignedError)} | ${formatError(meanAbsoluteError)} |`,
        );
    console.log(JSON.stringify(rows));
  },
});
