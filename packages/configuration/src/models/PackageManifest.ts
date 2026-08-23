export interface PackageManifest {
  dependencies?: Record<string, string>;
  name?: string;
  peerDependencies?: Record<string, string>;
  private?: boolean;
}
