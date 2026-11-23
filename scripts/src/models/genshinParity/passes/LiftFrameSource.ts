import type { LiftFrame } from "#src/models/genshinParity/passes/LiftFrame";

// The page a door's lift is sampled from. Its clock moves only as `advance` moves it, and `readFrame` resolves once the
// Page Has drawn every frame the clock has passed, with the last of them
export interface LiftFrameSource {
  advance: (ms: number) => Promise<void>;
  readFrame: () => Promise<LiftFrame>;
}
