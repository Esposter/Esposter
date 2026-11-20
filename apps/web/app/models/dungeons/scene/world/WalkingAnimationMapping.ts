import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { Direction } from "grid-engine-headless";

// The frames a character walks with, by the direction it faces
export type WalkingAnimationMapping = Partial<Record<Direction, FrameRow>>;
