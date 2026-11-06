import type { PackageManifest } from "@esposter/configuration";

// The two fields of a package's manifest the shape check reads that PackageManifest does not carry
export interface PackageShapeManifest extends PackageManifest {
  exports?: Record<string, unknown>;
  keywords?: string[];
}
