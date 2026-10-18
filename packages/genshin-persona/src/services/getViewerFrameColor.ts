import { HEX_RADIX, VIEWER_DEFAULT_FRAME_COLOR } from "#src/services/constants";
import { CharacterColorMap } from "#src/services/CharacterColorMap";

// The frame of a character's bubble: the character's own colour from the nameplate palette, else white
export const getViewerFrameColor = (name: string): number => {
  const color = CharacterColorMap[name];
  return color ? Number.parseInt(color.slice(1), HEX_RADIX) : VIEWER_DEFAULT_FRAME_COLOR;
};
