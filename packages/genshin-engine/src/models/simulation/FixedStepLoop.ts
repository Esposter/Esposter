// A loop that runs its step in fixed steps, however the frames fall: `advance` takes a frame's real seconds and runs
// As many whole steps as they hold, and `getStepShare` is how far the time left over has come into the next step, from 0
// To 1, which a frame blends what it draws between the last two steps by
export interface FixedStepLoop {
  advance: (deltaSeconds: number) => void;
  getStepShare: () => number;
}
