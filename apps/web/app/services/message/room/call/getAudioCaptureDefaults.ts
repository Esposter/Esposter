import type { AudioCaptureConstraints } from "@/models/message/room/call/AudioCaptureConstraints";

import { NoiseSuppressionMode } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

// Maps the user's Input Profile to browser getUserMedia audio processing constraints. Voice Isolation turns everything
// On, Studio turns everything off (raw mic), Custom leaves the browser defaults, which are on as well
export const getAudioCaptureDefaults = (noiseSuppressionMode: NoiseSuppressionMode): AudioCaptureConstraints => {
  switch (noiseSuppressionMode) {
    case NoiseSuppressionMode.Custom:
    case NoiseSuppressionMode.VoiceIsolation:
      return { autoGainControl: true, echoCancellation: true, noiseSuppression: true };
    case NoiseSuppressionMode.Studio:
      return { autoGainControl: false, echoCancellation: false, noiseSuppression: false };
    default:
      return exhaustiveGuard(noiseSuppressionMode);
  }
};
