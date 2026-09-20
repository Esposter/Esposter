import type { VoiceRequestType } from "#src/models/VoiceRequestType";

// Sent by a teardown, so the weights the process holds open can be deleted
export interface StopRequest {
  type: typeof VoiceRequestType.Stop;
}
