import type { VoiceRequest } from "#src/models/VoiceRequest";

import { reachVoiceServer } from "#src/services/reachVoiceServer";

// One request handed to the synthesizer and left with it, spawning one first when nothing listens: the hooks',
// Which the display and the session start wait on, so nothing here waits for the engine to load or the line to be
// Read. The connection is closed once the line is handed to the pipe, which keeps it for the server; the answer
// The server writes to a closed connection is its error handler's to drop
export const deliverVoiceRequest = async (request: VoiceRequest): Promise<void> => {
  const socket = await reachVoiceServer();
  if (!socket) return;

  await new Promise<void>((resolve) => {
    socket.write(`${JSON.stringify(request)}\n`, () => {
      socket.destroy();
      resolve();
    });
  });
};
