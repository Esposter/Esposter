export interface OutdatedDependency {
  current: string;
  dependencyType: string;
  dependents: string[];
  latest: string;
  packageName: string;
  specifier: string;
}
