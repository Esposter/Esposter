export interface SupersededPackage {
  // The URL of the page that says so, so a reader can check the claim rather than trust the map
  source: string;
  // The package a predecessor's own README or repository names as the one to use instead
  successor: string;
}
