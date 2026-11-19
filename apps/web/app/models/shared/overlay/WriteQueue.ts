import type { TouchedKey } from "#src/models/shared/overlay/TouchedKey";

// Runs a write once every earlier write that shares a touched key with it has settled
export type WriteQueue = (touches: TouchedKey[], run: () => Promise<void>) => Promise<void>;
