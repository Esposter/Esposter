import type { PcmClip } from "#src/models/PcmClip";

import { HOP_SECONDS, MIN_TURN_PAUSE_SECONDS, SPEECH_FLOOR_DB } from "#src/services/constants";
import { getFloorDb } from "#src/services/getFloorDb";
import { getFrameEnergiesDb } from "#src/services/getFrameEnergiesDb";

// A dialogue's first turn: the clip from where speech starts to the first silence long enough to be the other
// Speaker's cue. A clip with no such silence is one voice throughout and is kept whole
export const cutOpeningTurn = (clip: PcmClip): PcmClip => {
  const energiesDb = getFrameEnergiesDb(clip);
  const speechFloorDb = getFloorDb(energiesDb, SPEECH_FLOOR_DB);
  const pauseFrames = Math.round(MIN_TURN_PAUSE_SECONDS / HOP_SECONDS);
  const firstSpeechFrame = energiesDb.findIndex((energyDb) => energyDb >= speechFloorDb);
  let quietFrames = 0;
  for (let frame = firstSpeechFrame; frame < energiesDb.length; frame++) {
    const energyDb = energiesDb[frame] ?? Number.NEGATIVE_INFINITY;
    quietFrames = energyDb >= speechFloorDb ? 0 : quietFrames + 1;
    if (quietFrames === pauseFrames) {
      const pauseStart = frame - pauseFrames + 1;
      const pauseSample = Math.round(pauseStart * HOP_SECONDS * clip.sampleRate);
      return { sampleRate: clip.sampleRate, samples: clip.samples.subarray(0, pauseSample) };
    }
  }

  return clip;
};
