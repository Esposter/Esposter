import type { SpritePlacement } from "#src/models/dungeons/scene/world/SpritePlacement";
import type { Position } from "grid-engine-headless";

import { STEP_PROGRESS } from "#src/services/dungeons/gridEngine/constants";
import { StepDeltaMap } from "#src/services/dungeons/gridEngine/StepDeltaMap";

// The pixel a sprite is drawn at, floored: its tile's corner, centred on the tile and bottom aligned on it, plus the
// Custom offset, plus the share of a tile the step has covered towards the facing direction
export const getSpritePixelPosition = ({
  customOffset,
  displayHeight,
  displayWidth,
  facing,
  position,
  progress,
  tileHeight,
  tileWidth,
}: SpritePlacement): Position => {
  const step = StepDeltaMap[facing];
  const share = progress / STEP_PROGRESS;
  return {
    x: Math.floor(
      position.x * tileWidth +
        tileWidth / 2 -
        Math.floor(displayWidth / 2) +
        customOffset.x +
        step.x * tileWidth * share,
    ),
    y: Math.floor(position.y * tileHeight - displayHeight + tileHeight + customOffset.y + step.y * tileHeight * share),
  };
};
