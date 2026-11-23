import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { parseGameDataObjectPath } from "#scripts/gameData/mirror/parseGameDataObjectPath";
import { HOSTED_ASSETS_LOCAL_BASE_URL } from "hosted-assets";
import { vi } from "vitest";

// Every suite's fetch route to the hosted game data and the hosted objects: a read under a local base that names a hosted
// File is answered from the mirror, and any other request goes to the fetch the environment had.
const LOCAL_BASE_URLS: readonly string[] = [GAME_DATA_LOCAL_BASE_URL, HOSTED_ASSETS_LOCAL_BASE_URL];
const baseFetch = globalThis.fetch;

vi.stubGlobal("fetch", async (input: Parameters<typeof fetch>[0], init?: RequestInit): Promise<Response> => {
  const localBaseUrl =
    typeof input === "string" ? LOCAL_BASE_URLS.find((base) => input.startsWith(`${base}/`)) : undefined;
  if (typeof input !== "string" || localBaseUrl === undefined) return baseFetch(input, init);
  const gameDataObject = parseGameDataObjectPath(input.slice(localBaseUrl.length));
  if (gameDataObject === undefined) return baseFetch(input, init);
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- imported at a suite's first read, so a suite that mocks part of the mirror gets its own mock rather than the module this setup would have loaded first
  const { readMirroredGameDataFile } = await import("#scripts/gameData/mirror/readMirroredGameDataFile");
  const bytes = await readMirroredGameDataFile(gameDataObject.sourcePath, gameDataObject.hash);
  // A Uint8Array over the bytes, which is the body type a Response takes, where a Buffer's type is not
  return new Response(new Uint8Array(bytes), { headers: { "Content-Type": gameDataObject.contentType } });
});
