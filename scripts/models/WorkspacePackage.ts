import type { PackageManifest } from "@esposter/configuration";

export interface WorkspacePackage {
  directory: string;
  manifest: PackageManifest;
}
