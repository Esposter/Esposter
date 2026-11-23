import type { HostedAssetName } from "hosted-assets";

// One object before it is stored: its name, which is the sha256 of its decoded bytes under the scope it is stored
// Under, and Those bytes. An index is a record too, with `isIndex` set, so a publish stores its entries before it
export interface HostedAssetRecord extends HostedAssetName {
  bytes: Buffer;
  isIndex: boolean;
}
