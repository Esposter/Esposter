import type { Socket } from "node:net";

import { MESSAGE_DISPLAY_HOOK_TIMEOUT_MS, VOICE_RETRY_INTERVAL_MS } from "#src/services/constants";
import { openVoiceSocket } from "#src/services/openVoiceSocket";
import { spawnVoiceServer } from "#src/services/spawnVoiceServer";
import { setTimeout } from "node:timers/promises";

// A connection to a running synthesizer at once; otherwise one is spawned and asked again every interval until it
// Binds, exits, or the budget runs out. The server binds before it loads the engine, so the wait here is a node
// Start and never the load; a request that finds no server is one the caller stays silent on
export const reachVoiceServer = async (): Promise<Socket | undefined> => {
  const socket = await openVoiceSocket();
  if (socket) return socket;

  let hasExited = false;
  spawnVoiceServer().on("exit", () => {
    hasExited = true;
  });
  const deadline = performance.now() + MESSAGE_DISPLAY_HOOK_TIMEOUT_MS;
  while (performance.now() < deadline) {
    await setTimeout(VOICE_RETRY_INTERVAL_MS);
    const retry = await openVoiceSocket();
    if (retry) return retry;
    if (hasExited) return undefined;
  }

  return undefined;
};
