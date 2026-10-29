import { CHARACTER_PACK_FETCH_TIMEOUT_MS } from "#src/services/character/constants";
import { readStreamedBlob } from "#src/services/character/readStreamedBlob";
import { readFileResponse } from "#src/services/shared/readFileResponse";

// A file fetched from its url, each chunk of its body reported as it arrives, and kept in the cache under that url only
// Once the whole body is in, so a file cut short is never kept
export const storeCharacterPackFile = async (
  cache: Pick<Cache, "put">,
  url: string,
  onChunk: (byteLength: number) => void,
): Promise<void> => {
  const response = await readFileResponse(url, CHARACTER_PACK_FETCH_TIMEOUT_MS);
  const blob = await readStreamedBlob(response, onChunk);
  await cache.put(url, new Response(blob));
};
