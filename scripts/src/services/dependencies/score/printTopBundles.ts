import type { DependencyScore } from "#src/models/dependencies/score/DependencyScore";
import type { ColorPalette } from "#src/models/outdatedDependencies/print/ColorPalette";

import { TOP_BUNDLE_COUNT } from "#src/services/dependencies/score/constants";
import { formatBytes } from "#src/services/dependencies/score/formatBytes";

// The packages adding the most gzipped bytes to the app's client bundle, each with its ledger verdict, largest first
export const printTopBundles = (scores: DependencyScore[], color: ColorPalette): void => {
  const topScores = scores
    .filter(({ bundleBytes }) => bundleBytes > 0)
    .toSorted((left, right) => right.bundleBytes - left.bundleBytes)
    .slice(0, TOP_BUNDLE_COUNT);

  console.log(color.cyan(`Top ${TOP_BUNDLE_COUNT} by bundle cost`));
  for (const [index, { bundleBytes, packageName, verdict }] of topScores.entries())
    console.log(`${index + 1}. ${packageName}: ${formatBytes(bundleBytes)} gzipped, verdict ${verdict}`);
};
