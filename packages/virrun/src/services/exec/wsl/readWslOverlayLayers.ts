import type { OverlayLayers } from "#src/models/exec/OverlayLayers";

import { readWslPath } from "#src/services/exec/wsl/readWslPath";

// The overlay layers carry host (Windows) paths to the snapshot cache, so translate every one through
// Wslpath before they reach the Linux bwrap argv — exactly as cwd and bindDirectories are translated.
export const readWslOverlayLayers = ({ lowerDirectories, persistentOverlay }: OverlayLayers): OverlayLayers => ({
  lowerDirectories: lowerDirectories?.map((lowerDirectory) => readWslPath(lowerDirectory)),
  ...(persistentOverlay && {
    persistentOverlay: {
      upperDirectory: readWslPath(persistentOverlay.upperDirectory),
      workDirectory: readWslPath(persistentOverlay.workDirectory),
    },
  }),
});
