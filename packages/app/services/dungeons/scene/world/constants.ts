import type { FrameRow, WalkingAnimationMapping } from "grid-engine";

import { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import { Direction } from "grid-engine";

export const MAX_STEPS_BEFORE_NEXT_ENCOUNTER = 20;

export const DIALOG_PADDING = 90;
export const DIALOG_WIDTH = 1280 - DIALOG_PADDING * 2;
export const DIALOG_HEIGHT = 124;
export const DIALOG_DEPTH = 2000;

const BasePlayerWalkingAnimationMapping = {
  [InteractableDirection.DOWN]: {
    leftFoot: 6,
    rightFoot: 8,
    standing: 7,
  },
  [InteractableDirection.LEFT]: {
    leftFoot: 9,
    rightFoot: 11,
    standing: 10,
  },
  [InteractableDirection.RIGHT]: {
    leftFoot: 3,
    rightFoot: 5,
    standing: 4,
  },
  [InteractableDirection.UP]: {
    leftFoot: 0,
    rightFoot: 2,
    standing: 1,
  },
} as const satisfies Record<InteractableDirection, FrameRow>;

export const PlayerWalkingAnimationMapping = {
  ...BasePlayerWalkingAnimationMapping,
  [Direction.DOWN_LEFT]: BasePlayerWalkingAnimationMapping[Direction.LEFT],
  [Direction.DOWN_RIGHT]: BasePlayerWalkingAnimationMapping[Direction.RIGHT],
  [Direction.UP_LEFT]: BasePlayerWalkingAnimationMapping[Direction.LEFT],
  [Direction.UP_RIGHT]: BasePlayerWalkingAnimationMapping[Direction.RIGHT],
} as const satisfies WalkingAnimationMapping;
