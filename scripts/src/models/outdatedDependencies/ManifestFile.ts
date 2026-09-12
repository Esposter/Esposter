import type { PackageManifest } from "@esposter/configuration";

export interface ManifestFile {
  manifest: PackageManifest;
  path: string;
}
