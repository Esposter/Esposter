export interface PnpmOutdatedDependency {
  current?: string;
  dependencyType?: string;
  dependentPackages?: { name: string }[];
  latest: string;
}
