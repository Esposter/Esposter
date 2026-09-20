import type { VoiceRequest } from "#src/models/VoiceRequest";

import { VOICE_SOCKET_PATH } from "#src/services/constants";
import { createConnection } from "node:net";

// One request over one connection: the JSON line written, the status line read back, and nothing when no server
// Answers at the address or it closes before answering
export const connectVoiceServer = (request: VoiceRequest): Promise<string | undefined> =>
  new Promise((resolve) => {
    let reply = "";
    const socket = createConnection(VOICE_SOCKET_PATH);
    socket.setEncoding("utf8");
    socket.on("connect", () => {
      socket.write(`${JSON.stringify(request)}\n`);
    });
    socket.on("data", (chunk: string) => {
      reply += chunk;
      if (reply.includes("\n")) socket.destroy();
    });
    socket.on("error", () => {
      resolve(undefined);
    });
    socket.on("close", () => {
      resolve(reply.includes("\n") ? reply.trim() : undefined);
    });
  });
