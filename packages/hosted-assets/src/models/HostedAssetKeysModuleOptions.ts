// What a product's key map is written from at `nuxt prepare`: its lock and the file its keys are written to, both relative to the app's root
// A product with a scope names each key by its path under the scope, as a file product's keys are named
// A product without a scope names each key by its lock key
export interface HostedAssetKeysModuleOptions {
  keysPath: string;
  lockPath: string;
  product: string;
  scope?: string;
}
