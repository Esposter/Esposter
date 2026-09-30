import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/constants";
import { join } from "node:path";

// Where one component's exports go: its assets, its blocks' layout dumps, and the placements composed from them
export const getComponentDirectory = (
  component: DerivedAssetComponent,
): Record<"assets" | "layout" | "placements", string> => {
  const root = join(EXTRACTED_DIRECTORY, component);
  return { assets: join(root, "assets"), layout: join(root, "layout"), placements: join(root, "placements.json") };
};
