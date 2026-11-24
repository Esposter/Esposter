// What a product's key map is written from at `nuxt prepare`: its lock and the file its keys are written to, both
// Relative to the app's root. Each key is named by its path after the scope its lock key starts with
export interface HostedAssetKeysModuleOptions {
  keysPath: string;
  lockPath: string;
  product: string;
}
