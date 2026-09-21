import type { VoiceRequest } from "#src/models/VoiceRequest";

import { askVoiceServer } from "#src/services/askVoiceServer";
import { reachVoiceServer } from "#src/services/reachVoiceServer";

// The status line the synthesizer answers with, spawning one first when nothing listens, or "" once nothing
// Answered: the `voice` verb's, which reports the status and the device the answer carries
export const sendVoiceRequest = async (request: VoiceRequest): Promise<string> => {
  const socket = await reachVoiceServer();
  return (socket && (await askVoiceServer(socket, request))) || "";
};
