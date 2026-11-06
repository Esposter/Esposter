import type { PackageShapeManifest } from "#src/models/workspace/PackageShapeManifest";

import { HEADLESS_KEYWORD } from "#src/services/workspace/constants";

// The one statement of which packages the shape check applies to: a headless name or a headless keyword
export const checkIsHeadlessPackage = (manifest: PackageShapeManifest): boolean => {
  const isHeadlessNamed = Boolean(manifest.name?.includes(HEADLESS_KEYWORD));
  const isHeadlessKeyworded = Boolean(manifest.keywords?.includes(HEADLESS_KEYWORD));
  return isHeadlessNamed || isHeadlessKeyworded;
};
