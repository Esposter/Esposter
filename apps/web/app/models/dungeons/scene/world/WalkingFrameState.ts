// Where a character's walking animation stands: the frame it shows and which foot the last step planted.
// Once a step has planted its foot, it also holds the id of the tile that step left.
// So a later reading of the same step does not plant it again.
export interface WalkingFrameState {
  frame: number;
  isLastFootLeft: boolean;
  plantedFrom?: string;
}
