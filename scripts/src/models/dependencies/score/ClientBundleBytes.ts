// A package's gzipped bytes in the app's client bundle, and how many of them sit in the entry chunk every page loads
export interface ClientBundleBytes {
  bytes: number;
  entryBytes: number;
}
