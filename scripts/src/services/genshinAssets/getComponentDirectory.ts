import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/constants";
import { join } from "node:path";

// Where one component's exports go: its assets, its blocks' layout dumps, and its shaders' disassembled programs
export const getComponentDirectory = (
  component: DerivedAssetComponent,
): Record<"assets" | "layout" | "root" | "shaders", string> => {
  const root = join(EXTRACTED_DIRECTORY, component);
  return { assets: join(root, "assets"), layout: join(root, "layout"), root, shaders: join(root, "shaders") };
};
