import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

export interface InstalledPackage {
  directory: string;
  manifest: InstalledManifest;
}
