import type { Plugin } from "rolldown";

import { MODULE_PATH_COMMENT_REGEX } from "#src/services/constants";

// Rolldown renders each chunk, and a chunk that holds a copied CommonJS module opens with the path comment above, which
// Names the store the module was read from. The comment does nothing at run time, so it is dropped as the chunk renders
export const dropModulePathCommentsPlugin = (): Plugin => ({
  name: "drop-module-path-comments",
  renderChunk: (code) => code.replace(MODULE_PATH_COMMENT_REGEX, ""),
});
