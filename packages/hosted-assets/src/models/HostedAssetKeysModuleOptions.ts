// What a product's key map is written from at `nuxt prepare`: its lock and the file its keys are written to, both
// Relative to the app's root `isNameDerived` names each key by its path after the scope its lock key starts with, as a
// Files product's keys are named without it, each key is named by its lock key
export interface HostedAssetKeysModuleOptions {
  isNameDerived: boolean;
  keysPath: string;
  lockPath: string;
  product: string;
}
