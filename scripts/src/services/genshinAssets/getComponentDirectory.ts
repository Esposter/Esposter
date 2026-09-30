import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/constants";
import { join } from "node:path";

// Where one component's exports go: its assets, its blocks' layout dumps, its scripts' raw bytes, and its shaders'
// Disassembled programs
export const getComponentDirectory = (
  component: DerivedAssetComponent,
): Record<"assets" | "behaviours" | "layout" | "root" | "shaders", string> => {
  const root = join(EXTRACTED_DIRECTORY, component);
  return {
    assets: join(root, "assets"),
    behaviours: join(root, "behaviours"),
    layout: join(root, "layout"),
    root,
    shaders: join(root, "shaders"),
  };
};
