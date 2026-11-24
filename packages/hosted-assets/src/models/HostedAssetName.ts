// What names an object and so fixes its url: its scope, the sha256 of its bytes, and its extension. A lock entry
// Carries its name with its byte count, and an index entry carries its name alone, since an index holds the sha256 of
// Each entry
export interface HostedAssetName {
  extension: string;
  scope: string;
  sha256: string;
}
