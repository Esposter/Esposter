import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const closeAudioContext = getSynchronizedFunction((audioContext: AudioContext) =>
  getResultAsync(() => audioContext.close()).match(noop, console.error),
);
