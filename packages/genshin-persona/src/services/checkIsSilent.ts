import { checkIsMuted } from "#src/services/checkIsMuted";
import { readVolume } from "#src/services/readVolume";

// Whether a reply would be heard at all, which is the gate in front of waking the engine and in front of every
// Request after it: a volume of zero is a gain that multiplies every sample away, so synthesizing for it costs a
// Reference fetch, a graph load and every token of the reply to arrive at silence the mute flag gets for nothing
export const checkIsSilent = (): boolean => checkIsMuted() || readVolume() === 0;
