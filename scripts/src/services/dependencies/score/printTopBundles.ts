import type { DependencyScore } from "#src/models/dependencies/score/DependencyScore";
import type { ColorPalette } from "#src/models/outdatedDependencies/print/ColorPalette";

import { TOP_BUNDLE_COUNT } from "#src/services/dependencies/score/constants";
import { formatBytes } from "#src/services/dependencies/score/formatBytes";

// The packages adding the most gzipped bytes to the app's client bundle, largest first, each with its ledger verdict and
// The share of it in the entry chunk, which every page loads, where a later load would take it off every page
export const printTopBundles = (scores: DependencyScore[], color: ColorPalette): void => {
  const topScores = scores
    .filter(({ bundleBytes }) => bundleBytes > 0)
    .toSorted((left, right) => right.bundleBytes - left.bundleBytes)
    .slice(0, TOP_BUNDLE_COUNT);

  console.log(color.cyan(`Top ${TOP_BUNDLE_COUNT} by bundle cost`));
  for (const [index, { bundleBytes, entryBytes, packageName, verdict }] of topScores.entries()) {
    const entryShare = entryBytes > 0 ? `, ${formatBytes(entryBytes)} of it in the entry chunk` : "";
    console.log(`${index + 1}. ${packageName}: ${formatBytes(bundleBytes)} gzipped${entryShare}, verdict ${verdict}`);
  }
};
