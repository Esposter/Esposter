import type { DependencyScoreReport } from "#src/models/dependencies/score/DependencyScoreReport";
import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { formatBytes } from "#src/services/dependencies/score/formatBytes";
import { printRegistryErrors } from "#src/services/outdatedDependencies/print/printRegistryErrors";
import { printTable } from "#src/services/outdatedDependencies/print/printTable";
import { formatAge } from "#src/services/shared/formatAge";

const YES = "yes";

// One row per catalog entry, in the order the report sorts them: highest score first, or largest bundle first. The
// Disagreements are listed under the table as rows to re-judge, and an entry no workspace installed is named, since its
// Installed dimensions score nothing.
export const printDependencyScores = (
  { bundleReportAgeMilliseconds, disagreements, errors, scores, unresolvedPackageNames }: DependencyScoreReport,
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
      "Bundle",
      "Install",
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
      score.bundleSkipReason === "" ? formatBytes(score.bundleBytes) : score.bundleSkipReason,
      score.installBytes === 0 ? "" : `${formatBytes(score.installBytes)}${score.isInstallShared ? " shared" : ""}`,
      score.verdict,
    ]),
    color,
  );

  console.log(`The bundle column reads the client bundle report written ${formatAge(bundleReportAgeMilliseconds)} ago`);
  console.log(color.cyan("Disagreements"));
  if (disagreements.length === 0) console.log("None");
  for (const { packageName, shimCount, total, verdict } of disagreements)
    console.log(`${packageName}: ${verdict}, scores ${total}, ${shimCount} type shims`);

  if (unresolvedPackageNames.length > 0)
    console.log(color.yellow(`Not installed by any workspace: ${unresolvedPackageNames.join(", ")}`));
  printRegistryErrors(errors, color);
};
