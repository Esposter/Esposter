import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";

// The frames drawn with one kind of the scene's objects hidden: the kind, named by the component that holds it, and how
// Many objects that draw it hid
export interface SceneKindRange extends FrameRange {
  drawables: number;
  kind: string;
}
