import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { basename } from "node:path";
import { vi } from "vitest";

// Every suite's fetch route to the hosted game data: a read under the local base is answered from the mirror, and any
// Other request goes to the fetch the environment had. The mirror is imported only at a suite's first read, so a suite
// That mocks part of it gets its own mock rather than the module this setup would otherwise have loaded first
const baseFetch = globalThis.fetch;

vi.stubGlobal("fetch", async (input: Parameters<typeof fetch>[0], init?: RequestInit): Promise<Response> => {
  if (typeof input !== "string" || !input.startsWith(`${GAME_DATA_LOCAL_BASE_URL}/`)) return baseFetch(input, init);
  const { readMirroredGameDataObject } = await import("#scripts/gameData/mirror/readMirroredGameDataObject");
  const json = await readMirroredGameDataObject(basename(input, ".json"));
  return new Response(json, { headers: { "Content-Type": "application/json" } });
});
