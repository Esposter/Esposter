// The frames one of gcsim's helpers builds for an action: its animation, which every cancel not overridden waits for,
// And for a normal attack the hitmark its early cancels wait for
export interface GoFrames {
  animationFrames: number;
  hitmarkFrames?: number;
}
