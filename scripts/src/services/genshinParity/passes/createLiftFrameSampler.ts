import type { LiftFrame } from "#src/models/genshinParity/passes/LiftFrame";
import type { LiftFrameSource } from "#src/models/genshinParity/passes/LiftFrameSource";

// The sampler of a door's lift: each call steps the clock on by `stepMs` and returns the frame the page has drawn by
// Then. The frames are fixed by the clock's steps, never by how many frames the page managed to draw, so a page that
// Draws Slowly reads the same frames as one that draws at once
export const createLiftFrameSampler =
  (source: LiftFrameSource, stepMs: number): (() => Promise<LiftFrame>) =>
  async () => {
    await source.advance(stepMs);
    return source.readFrame();
  };
