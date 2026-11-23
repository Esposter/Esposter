import type { HostedAssetName } from "hosted-assets";

// One object as it is stored: its name, which is the sha256 of its compact JSON under the scope it is stored under, and
// The JSON itself. An index is a record too, with `isIndex` set, so a publish stores its entries before it
export interface HostedAssetRecord extends HostedAssetName {
  isIndex: boolean;
  json: string;
}
