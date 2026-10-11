// The fields of an installed package's own `package.json` the score reads, which `PackageManifest` does not carry
export interface InstalledManifest {
  dependencies?: Record<string, string>;
  exports?: unknown;
  main?: string;
  module?: string;
  name?: string;
  peerDependencies?: Record<string, string>;
  type?: string;
  types?: string;
  typings?: string;
}
