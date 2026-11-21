// Where a character's walking animation stands: the frame it shows, which foot the last step planted, and, once a step has
// Planted its foot, the id of the tile that step left, so a later reading of the same step does not plant it again
export interface WalkingFrameState {
  frame: number;
  isLastFootLeft: boolean;
  plantedFrom?: string;
}
