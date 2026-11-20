import type { PackageManifest } from "@esposter/configuration";

// The field of a package's manifest the shape check reads that PackageManifest does not carry
export interface PackageShapeManifest extends PackageManifest {
  keywords?: string[];
}
