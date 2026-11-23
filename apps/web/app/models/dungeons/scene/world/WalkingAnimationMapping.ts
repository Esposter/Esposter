import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { Direction } from "grid-engine-headless";

// The frames a character walks with in each direction it faces. A direction with no frames leaves the sprite's frame as
// It is
export type WalkingAnimationMapping = Partial<Record<Direction, FrameRow>>;
