// One catalog entry's score out of 100, with each dimension's points and the unscored context beside them
export interface DependencyScore {
  bundleBytes: number;
  bundleSkipReason: string;
  dependencyLines: number;
  entryBytes: number;
  formatPoints: number;
  importerCount: number;
  installBytes: number;
  isDeprecated: boolean;
  isInstallShared: boolean;
  manifestCount: number;
  packageName: string;
  releaseCount: number;
  selfContainmentPoints: number;
  shimCount: number;
  sizePoints: number;
  sourceLines: number;
  stabilityPoints: number;
  total: number;
  verdict: string;
}
