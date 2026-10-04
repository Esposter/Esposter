import type { ComponentDirectory } from "#src/models/genshinAssets/shared/ComponentDirectory";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// Where one component's exports go (`ComponentDirectory`): its shaders as their disassembled programs, its music as its
// Playlist and decoded sources
export const getComponentDirectory = (component: DerivedAssetComponent): ComponentDirectory => {
  const root = join(EXTRACTED_DIRECTORY, component);
  return {
    assets: join(root, "assets"),
    behaviours: join(root, "behaviours"),
    layout: join(root, "layout"),
    music: join(root, "music"),
    root,
    shaders: join(root, "shaders"),
  };
};
