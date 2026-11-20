// Where a character's walking animation stands: the frame it shows, and which foot the last step planted
export interface WalkingFrameState {
  frame: number;
  isLastFootLeft: boolean;
}
