import type { FramePlacement } from "@/models/pageBuilder/FramePlacement";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// The height a toolbar takes in the app's viewport, so that above its node it clears the node's top edge
export const TOOLBAR_HEIGHT = 40;
// Where the selection's toolbar sits in the app's viewport. Above the node when the frame has room for it, below the node when
// It does not, and nowhere once the node has scrolled out of the frame, so the toolbar never floats over content it is not for
export const getToolbarPlacement = (box: OverlayBox, frame: FramePlacement) => {
  const top = frame.top + box.top * frame.scale;
  const bottom = top + box.height * frame.scale;
  const frameBottom = frame.top + frame.height;
  if (bottom <= frame.top || top >= frameBottom) return undefined;

  const left = frame.left + box.left * frame.scale;
  const aboveTop = top - TOOLBAR_HEIGHT;
  if (aboveTop >= frame.top) return { left, top: aboveTop };
  // A node running past the frame's bottom edge keeps its toolbar inside the frame, over the node's last rows
  return { left, top: Math.min(bottom, frameBottom - TOOLBAR_HEIGHT) };
};
