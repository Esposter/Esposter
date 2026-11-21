import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { WalkingAnimationMapping } from "#src/models/dungeons/scene/world/WalkingAnimationMapping";

import { InteractableDirection } from "#src/models/dungeons/direction/InteractableDirection";
import { Direction } from "grid-engine-headless";

export const MAX_STEPS_BEFORE_NEXT_ENCOUNTER = 20;

export const DIALOG_PADDING = 90;
export const DIALOG_WIDTH = 1280 - DIALOG_PADDING * 2;
export const DIALOG_HEIGHT = 124;
export const DIALOG_DEPTH = 2000;

const BasePlayerWalkingAnimationMapping = {
  [InteractableDirection.DOWN]: { leftFoot: 6, rightFoot: 8, standing: 7 },
  [InteractableDirection.LEFT]: { leftFoot: 9, rightFoot: 11, standing: 10 },
  [InteractableDirection.RIGHT]: { leftFoot: 3, rightFoot: 5, standing: 4 },
  [InteractableDirection.UP]: { leftFoot: 0, rightFoot: 2, standing: 1 },
} as const satisfies Record<InteractableDirection, FrameRow>;

export const PlayerWalkingAnimationMapping = {
  ...BasePlayerWalkingAnimationMapping,
  [Direction.DownLeft]: BasePlayerWalkingAnimationMapping[Direction.Left],
  [Direction.DownRight]: BasePlayerWalkingAnimationMapping[Direction.Right],
  [Direction.UpLeft]: BasePlayerWalkingAnimationMapping[Direction.Left],
  [Direction.UpRight]: BasePlayerWalkingAnimationMapping[Direction.Right],
} as const satisfies WalkingAnimationMapping;
