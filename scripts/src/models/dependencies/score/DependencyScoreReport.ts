import type { DependencyScore } from "#src/models/dependencies/score/DependencyScore";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";

export interface DependencyScoreReport {
  bundleReportAgeMilliseconds: number;
  disagreements: DependencyScore[];
  errors: RegistryCheckError[];
  scores: DependencyScore[];
  unresolvedPackageNames: string[];
}
