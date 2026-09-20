import type { VoiceDeviceRung } from "#src/models/VoiceDeviceRung";
import type { VoiceModel } from "#src/models/VoiceModel";

// The engine as loaded on one rung of the device ladder, with the rungs it can still move down to
export interface LoadedVoiceModel {
  model: VoiceModel;
  rung: VoiceDeviceRung;
  rungsBelow: VoiceDeviceRung[];
}
