import { HOSTED_ASSETS_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { readStreamedBlob } from "#src/services/readStreamedBlob";
import { readFileResponse, withFinalizerAsync } from "@esposter/shared";

// The stores still fetching, by url, so a store asked for a url already in flight joins it rather than fetching again
const storesInFlight = new Map<string, Promise<Blob>>();

// A file fetched from its url, each chunk of its body reported as it arrives, and kept in the cache under that url only
// Once the whole body is in, so a file cut short is never kept. A store of a url already in flight joins that store and
// Reports the file's bytes once they are in, so a read the preload overlaps is held, not fetched a second time
export const storeHostedAssetFile = async (
  cache: Pick<Cache, "put">,
  url: string,
  onChunk: (byteLength: number) => void,
): Promise<Blob> => {
  const inFlight = storesInFlight.get(url);
  if (inFlight) {
    const blob = await inFlight;
    onChunk(blob.size);
    return blob;
  }
  const store = withFinalizerAsync(
    async () => {
      const response = await readFileResponse(url, HOSTED_ASSETS_FETCH_TIMEOUT_MS);
      const blob = await readStreamedBlob(response, onChunk);
      await cache.put(url, new Response(blob));
      return blob;
    },
    () => {
      storesInFlight.delete(url);
    },
  );
  storesInFlight.set(url, store);
  return store;
};
