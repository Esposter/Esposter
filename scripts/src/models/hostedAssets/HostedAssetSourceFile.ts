// One file of a product's source folder, read as the object it publishes: its key under the folder, its decoded bytes
// And the sha256 those bytes hash to, which names the object
export interface HostedAssetSourceFile {
  bytes: Buffer;
  extension: string;
  key: string;
  sha256: string;
}
