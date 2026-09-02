export interface OutdatedDependency {
  current: string;
  dependencyType: string;
  dependents: string[];
  latest: string;
  pkg: string;
  specifier: string;
}
