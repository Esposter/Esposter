import type { VoiceDeviceLadder } from "#src/models/VoiceDeviceLadder";

import { PLATFORM_VOICE_DEVICE_LADDER_MAP, VOICE_CPU_DEVICE_LADDER } from "#src/services/constants";

// The device ladder the platform's own rungs make, or the CPU alone for a platform with none
export const getVoiceDeviceLadder = (platform: NodeJS.Platform = process.platform): VoiceDeviceLadder =>
  PLATFORM_VOICE_DEVICE_LADDER_MAP[platform] ?? VOICE_CPU_DEVICE_LADDER;
