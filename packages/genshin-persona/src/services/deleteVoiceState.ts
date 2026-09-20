import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { connectVoiceServer } from "#src/services/connectVoiceServer";
import { VOICE_STATE_PATHS } from "#src/services/constants";
import { rmSync } from "node:fs";

// The voice half of the state directory: a running synthesizer is stopped first, since the weights it holds open
// Cannot be deleted under it, and what the pick records and the pin are is left alone
export const deleteVoiceState = async (): Promise<void> => {
  await connectVoiceServer({ type: VoiceRequestType.Stop });
  // The stopped process releases its files a moment after answering, which the retries cover
  for (const path of VOICE_STATE_PATHS) rmSync(path, { force: true, maxRetries: 10, recursive: true, retryDelay: 200 });
};
