import type { FrameAnalysis } from "#src/models/voiceMatch/FrameAnalysis";

import { HOP_SECONDS, SPEECH_FLOOR_DB } from "#src/services/voiceMatch/constants";
import { getFloorDb } from "#src/services/voiceMatch/getFloorDb";

// How long the clip is speaking for: the frames loud enough to be speech, so the silence a clip is padded with and
// The pauses inside it count against no rate
export const getSpeechSeconds = ({ energiesDb }: FrameAnalysis): number => {
  const speechFloorDb = getFloorDb(energiesDb, SPEECH_FLOOR_DB);
  const speechFrames = energiesDb.filter((energyDb) => energyDb >= speechFloorDb);
  return speechFrames.length * HOP_SECONDS;
};
