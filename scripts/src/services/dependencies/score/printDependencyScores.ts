import type { DependencyScoreReport } from "#src/models/dependencies/score/DependencyScoreReport";
import type { ColorPalette } from "#src/models/outdatedDependencies/print/ColorPalette";

import { printRegistryErrors } from "#src/services/outdatedDependencies/print/printRegistryErrors";
import { printTable } from "#src/services/outdatedDependencies/print/printTable";

const YES = "yes";

// One row per catalog entry, highest score first: the candidates to absorb lead. The disagreements are listed under the table
// As rows to re-judge, and an entry no workspace installed is named, since its installed dimensions score nothing.
export const printDependencyScores = (
  { disagreements, errors, scores, unresolvedPackageNames }: DependencyScoreReport,
  color: ColorPalette,
): void => {
  printTable(
    [
      "Package",
      "Score",
      "Size",
      "Stability",
      "Format",
      "Self-containment",
      "Source lines",
      "Dependency lines",
      "Importers",
      "Manifests",
      "Shims",
      "Deprecated",
      "Verdict",
    ],
    scores.map((score) => [
      score.packageName,
      String(score.total),
      String(score.sizePoints),
      String(score.stabilityPoints),
      String(score.formatPoints),
      String(score.selfContainmentPoints),
      String(score.sourceLines),
      String(score.dependencyLines),
      String(score.importerCount),
      String(score.manifestCount),
      String(score.shimCount),
      score.isDeprecated ? YES : "",
      score.verdict,
    ]),
    color,
  );

  console.log(color.cyan("Disagreements"));
  if (disagreements.length === 0) console.log("None");
  for (const { packageName, shimCount, total, verdict } of disagreements)
    console.log(`${packageName}: ${verdict}, scores ${total}, ${shimCount} type shims`);

  if (unresolvedPackageNames.length > 0)
    console.log(color.yellow(`Not installed by any workspace: ${unresolvedPackageNames.join(", ")}`));
  printRegistryErrors(errors, color);
};
