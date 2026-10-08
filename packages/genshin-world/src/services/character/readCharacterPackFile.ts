import { InvalidOperationError, Operation } from "@esposter/shared";

// A file of a character's pack, served from the app's Blob Storage under the character's id, by its path in the pack. A
// Path a model names may hold MMD's backslashes and letters of any script, so each of its parts is encoded on its own
export const readCharacterPackFile = async (
  characterPackBaseUrl: string,
  characterId: string,
  path: string,
  timeoutMs: number,
): Promise<Response> => {
  const encodedPath = path
    .split(/[/\\]/u)
    .map((part) => encodeURIComponent(part))
    .join("/");
  const url = `${characterPackBaseUrl}/${characterId}/${encodedPath}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
