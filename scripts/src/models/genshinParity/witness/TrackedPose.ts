// A recording's frame as the matchmove solved it: its time, the camera's pose and the pose's edge distance
export interface TrackedPose {
  distance: number;
  pose: number[];
  seconds: number;
}
