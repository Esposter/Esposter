// A package the report asks about, with the key its verdict is cached under
export interface PackageLookup {
  cacheKey: string;
  packageName: string;
}
