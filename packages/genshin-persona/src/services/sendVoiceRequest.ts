import type { VoiceRequest } from "#src/models/VoiceRequest";

import { connectVoiceServer } from "#src/services/connectVoiceServer";
import { VOICE_LOAD_BUDGET_MS, VOICE_RETRY_INTERVAL_MS } from "#src/services/constants";
import { spawnVoiceServer } from "#src/services/spawnVoiceServer";
import { setTimeout } from "node:timers/promises";

// The status line the synthesizer answers with, or "" once nothing answered: a running server is asked at once;
// Otherwise one is spawned and asked again every interval until it answers, exits, or the budget runs out. A
// Reply that cannot be spoken is not spoken, so "" is an outcome the hook stays silent on
export const sendVoiceRequest = async (request: VoiceRequest): Promise<string> => {
  const reply = await connectVoiceServer(request);
  if (reply !== undefined) return reply;

  let hasExited = false;
  spawnVoiceServer().on("exit", () => {
    hasExited = true;
  });
  const deadline = performance.now() + VOICE_LOAD_BUDGET_MS;
  while (performance.now() < deadline) {
    await setTimeout(VOICE_RETRY_INTERVAL_MS);
    const retry = await connectVoiceServer(request);
    if (retry !== undefined) return retry;
    if (hasExited) return "";
  }

  return "";
};
