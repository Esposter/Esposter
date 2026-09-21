import type { VoiceRequest } from "#src/models/VoiceRequest";

import { askVoiceServer } from "#src/services/askVoiceServer";
import { openVoiceSocket } from "#src/services/openVoiceSocket";

// One request to a server that is already running, answered; nothing when none is — a stop has nothing to spawn
export const connectVoiceServer = async (request: VoiceRequest): Promise<string | undefined> => {
  const socket = await openVoiceSocket();
  return socket ? askVoiceServer(socket, request) : undefined;
};
