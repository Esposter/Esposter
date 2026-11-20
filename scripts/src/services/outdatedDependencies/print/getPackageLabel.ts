// A package's name with its dependency type in brackets when it has one, so a dependency reads the same in each table
export const getPackageLabel = (packageName: string, dependencyType: string): string =>
  dependencyType ? `${packageName} (${dependencyType})` : packageName;
