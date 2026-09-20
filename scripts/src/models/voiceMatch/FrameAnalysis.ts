// A clip read frame by frame: the energy of every frame, and the pitch of the voiced ones — 0 for a frame that is
// Unvoiced, silent or too quiet to trust
export interface FrameAnalysis {
  energiesDb: number[];
  f0sHz: number[];
}
