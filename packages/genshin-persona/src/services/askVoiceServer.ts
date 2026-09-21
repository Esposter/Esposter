import type { VoiceRequest } from "#src/models/VoiceRequest";
import type { Socket } from "node:net";

// One request over one open connection, answered: the JSON line written, the status line read back, and nothing
// When the server closes before answering
export const askVoiceServer = (socket: Socket, request: VoiceRequest): Promise<string | undefined> =>
  new Promise((resolve) => {
    let answer = "";
    socket.on("data", (chunk: string) => {
      answer += chunk;
      if (answer.includes("\n")) socket.destroy();
    });
    socket.on("close", () => {
      resolve(answer.includes("\n") ? answer.trim() : undefined);
    });
    socket.write(`${JSON.stringify(request)}\n`);
  });
