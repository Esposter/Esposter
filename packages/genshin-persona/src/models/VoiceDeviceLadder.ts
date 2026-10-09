import type { VoiceDeviceRung } from "#src/models/VoiceDeviceRung";

// The rungs of one platform's device ladder, fastest first, and never empty: the last one is the CPU
export type VoiceDeviceLadder = [VoiceDeviceRung, ...VoiceDeviceRung[]];
