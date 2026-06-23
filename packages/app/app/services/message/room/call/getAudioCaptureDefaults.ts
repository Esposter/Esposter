import type { AudioCaptureOptions } from "livekit-client";

import { NoiseSuppressionMode } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

// Maps the user's Input Profile to browser getUserMedia audio processing constraints. Voice Isolation
// Turns everything on, Studio turns everything off (raw mic), Custom leaves the browser defaults.
export const getAudioCaptureDefaults = (noiseSuppressionMode: NoiseSuppressionMode): AudioCaptureOptions => {
  switch (noiseSuppressionMode) {
    case NoiseSuppressionMode.Custom:
      return {};
    case NoiseSuppressionMode.Studio:
      return { autoGainControl: false, echoCancellation: false, noiseSuppression: false };
    case NoiseSuppressionMode.VoiceIsolation:
      return { autoGainControl: true, echoCancellation: true, noiseSuppression: true };
    default:
      return exhaustiveGuard(noiseSuppressionMode);
  }
};
