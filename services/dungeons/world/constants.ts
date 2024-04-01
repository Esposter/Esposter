import type { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import type { FrameRow, Position, WalkingAnimationMapping } from "grid-engine";
import { Direction } from "grid-engine";

export const MAX_STEPS_BEFORE_NEXT_ENCOUNTER = 20;

export const DIALOG_PADDING = 90;
export const DIALOG_WIDTH = 1280 - DIALOG_PADDING * 2;
export const DIALOG_HEIGHT = 124;
export const DIALOG_DEPTH = 2000;

export const MENU_PADDING = 4;
export const MENU_WIDTH = 300;
export const MENU_DEPTH = 3000;

export const INITIAL_MENU_CURSOR_POSITION = { x: 20 + MENU_PADDING, y: 28 + MENU_PADDING } as const satisfies Position;
export const MENU_CURSOR_POSITION_INCREMENT = { x: 30, y: 50 } as const satisfies Position;

export const PlayerWalkingAnimationMapping: Record<InteractableDirection, FrameRow> = {
  [Direction.UP]: {
    leftFoot: 0,
    standing: 1,
    rightFoot: 2,
  },
  [Direction.DOWN]: {
    leftFoot: 6,
    standing: 7,
    rightFoot: 8,
  },
  [Direction.LEFT]: {
    leftFoot: 9,
    standing: 10,
    rightFoot: 11,
  },
  [Direction.RIGHT]: {
    leftFoot: 3,
    standing: 4,
    rightFoot: 5,
  },
} satisfies WalkingAnimationMapping;
