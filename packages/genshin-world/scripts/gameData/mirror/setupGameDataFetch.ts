import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { parseGameDataObjectPath } from "#scripts/gameData/mirror/parseGameDataObjectPath";
import { vi } from "vitest";

// Every suite's fetch route to the hosted game data: a read under the local base that names a hosted file is answered
// From the mirror, and any other request goes to the fetch the environment had.
const baseFetch = globalThis.fetch;

vi.stubGlobal("fetch", async (input: Parameters<typeof fetch>[0], init?: RequestInit): Promise<Response> => {
  if (typeof input !== "string" || !input.startsWith(`${GAME_DATA_LOCAL_BASE_URL}/`)) return baseFetch(input, init);
  const gameDataObject = parseGameDataObjectPath(input.slice(GAME_DATA_LOCAL_BASE_URL.length));
  if (gameDataObject === undefined) return baseFetch(input, init);
  // eslint-disable-next-line no-restricted-syntax -- imported at a suite's first read, so a suite that mocks part of the mirror gets its own mock rather than the module this setup would have loaded first
  const { readMirroredGameDataFile } = await import("#scripts/gameData/mirror/readMirroredGameDataFile");
  const bytes = await readMirroredGameDataFile(gameDataObject.sourcePath, gameDataObject.hash);
  // A Uint8Array over the bytes, which is the body type a Response takes, where a Buffer's type is not
  return new Response(new Uint8Array(bytes), { headers: { "Content-Type": gameDataObject.contentType } });
});
