import { HOSTED_ASSETS_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { readStreamedBlob } from "#src/services/readStreamedBlob";
import { readFileResponse } from "@esposter/shared";

// A file fetched from its url, each chunk of its body reported as it arrives, and kept in the cache under that url only
// Once the whole body is in, so a file cut short is never kept
export const storeHostedAssetFile = async (
  cache: Pick<Cache, "put">,
  url: string,
  onChunk: (byteLength: number) => void,
): Promise<void> => {
  const response = await readFileResponse(url, HOSTED_ASSETS_FETCH_TIMEOUT_MS);
  const blob = await readStreamedBlob(response, onChunk);
  await cache.put(url, new Response(blob));
};
