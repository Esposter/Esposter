import type { TouchedKey } from "#src/models/shared/overlay/TouchedKey";

// A write in flight or waiting, with the keys it touches and the promise that settles when it has
export interface QueuedWrite {
  settled: Promise<void>;
  touches: TouchedKey[];
}
