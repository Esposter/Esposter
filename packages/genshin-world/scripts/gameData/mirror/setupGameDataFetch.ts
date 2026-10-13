import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { basename } from "node:path";
import { vi } from "vitest";

// Every suite's fetch route to the hosted game data: a read under the local base is answered from the mirror, and any
// Other request goes to the fetch the environment had.
const baseFetch = globalThis.fetch;

vi.stubGlobal("fetch", async (input: Parameters<typeof fetch>[0], init?: RequestInit): Promise<Response> => {
  if (typeof input !== "string" || !input.startsWith(`${GAME_DATA_LOCAL_BASE_URL}/`)) return baseFetch(input, init);
  // eslint-disable-next-line no-restricted-syntax -- imported at a suite's first read, so a suite that mocks part of the mirror gets its own mock rather than the module this setup would have loaded first
  const { readMirroredGameDataObject } = await import("#scripts/gameData/mirror/readMirroredGameDataObject");
  const json = await readMirroredGameDataObject(basename(input, ".json"));
  return new Response(json, { headers: { "Content-Type": "application/json" } });
});
