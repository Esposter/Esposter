// What a package's importers say about whether it is in the app's client bundle, read for the skip reasons
export interface BundleScope {
  clientImporterCount: number;
  importerCount: number;
  isNuxtModule: boolean;
  isTypesOnly: boolean;
  packageName: string;
  valueClientImporterCount: number;
}
