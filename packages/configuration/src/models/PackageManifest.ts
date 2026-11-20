export interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  // Each subpath's arm names its `source` file under `src`, which is the one place a package declares what a subpath is
  exports?: Record<string, Record<string, string> | string>;
  // Declared by the one package a runtime host loads by convention rather than by resolution — the Functions app
  main?: string;
  name?: string;
  optionalDependencies?: Record<string, string>;
  packageManager?: string;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  private?: boolean;
  scripts?: Record<string, string>;
}
