/* oxlint-disable no-await-in-loop -- One device: each reference's witness page is its own browser render, and
   parallel renders exhaust the memory each holds */
import type { RadianceRow } from "#src/models/genshinParity/radiance/RadianceRow";
import type { RadianceTally } from "#src/models/genshinParity/radiance/RadianceTally";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { getBloomReferenceIds } from "#src/services/genshinParity/passes/getBloomReferenceIds";
import { mergeRadianceTallies } from "#src/services/genshinParity/radiance/mergeRadianceTallies";
import { readRadianceFrames } from "#src/services/genshinParity/radiance/readRadianceFrames";
import { tallyRadiance } from "#src/services/genshinParity/radiance/tallyRadiance";
import { toRadianceRows } from "#src/services/genshinParity/radiance/toRadianceRows";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { defineCommand } from "citty";

// The family a frame's every scored pixel is tallied under as well, so one row reads the whole frame's ratio. A uniform
// Exposure error shows in that row and in no single family
const EVERY_PIXEL = "every pixel";

// Formats a ratio or a radiance to three decimals
const formatValue = (value: number): string => value.toFixed(3);

// The tallies of a frame with every family also summed under the whole frame's name
const withEveryPixel = (tallies: readonly RadianceTally[]): RadianceTally[] => [
  ...tallies,
  ...mergeRadianceTallies([tallies.map((tally) => ({ ...tally, family: EVERY_PIXEL }))]),
];

// The table's rows as Markdown, one family's light a line
const printRows = (rows: readonly RadianceRow[]): void => {
  console.log("| Family | Light | Pixels | Clipped | Ours mean | Reference mean | Ratio | R | G | B |");
  console.log("| :----- | :---- | -----: | ------: | --------: | -------------: | ----: | -: | -: | -: |");
  for (const { channelRatios, clipped, family, light, oursMean, pixels, ratio, referenceMean } of rows)
    console.log(
      `| ${family} | ${light} | ${pixels} | ${clipped} | ${formatValue(oursMean)} | ${formatValue(referenceMean)} | ${formatValue(ratio)} | ${formatValue(channelRatios[0])} | ${formatValue(channelRatios[1])} | ${formatValue(channelRatios[2])} |`,
    );
};

// The references the table cannot read, each with the reason it is named and left out: the phone's door is framed at
// 4:3, which the scene's camera does not frame
const UNREADABLE_REFERENCES = new Map([["login-door", "the phone build's 4:3 framing is not the scene camera's"]]);

// The radiance table of every login reference whose screen draws the scene, per reference and pooled over all of them.
// Each family is read lit, shaded and whole. Its last line is the rows as JSON
export const radianceCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Recover each login reference's scene radiance from its display colour by the tone curve's inverse, and tabulate ours over it per family and light, as a ratio, with the bloom drawn off",
    name: "radiance",
  },
  run: async () => {
    const perReference: { referenceId: string; rows: RadianceRow[] }[] = [];
    const tallyLists: RadianceTally[][] = [];
    for (const referenceId of getBloomReferenceIds(Object.keys(ParityReferenceMap))) {
      const unreadableReason = UNREADABLE_REFERENCES.get(referenceId);
      if (unreadableReason) {
        console.log(`${referenceId}: not read, ${unreadableReason}`);
        continue;
      }
      const tallies = tallyRadiance(await readRadianceFrames(referenceId, DerivedAssetComponent.Login));
      tallyLists.push(tallies);
      perReference.push({ referenceId, rows: toRadianceRows(withEveryPixel(tallies)) });
    }
    const pooled = toRadianceRows(withEveryPixel(mergeRadianceTallies(tallyLists)));
    for (const { referenceId, rows } of perReference) {
      console.log(referenceId);
      printRows(rows);
    }
    console.log("pooled over the login references");
    printRows(pooled);
    console.log(JSON.stringify({ perReference, pooled }));
  },
});
