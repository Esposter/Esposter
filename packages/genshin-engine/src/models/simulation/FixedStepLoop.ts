// A loop that runs its step in fixed steps, however the frames fall: `advance` takes a frame's real seconds and runs
// As many whole steps as they hold
export interface FixedStepLoop {
  advance: (deltaSeconds: number) => void;
}
