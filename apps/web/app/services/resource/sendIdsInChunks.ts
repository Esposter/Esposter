import { chunk, MAX_READ_LIMIT } from "@esposter/shared";

// Sends the ids to the server a call at a time, each chunk at the server's per-call cap and in the order given.
// A chunk the server rejects stops the ones after it.
// The ones before it stay committed, so the caller reconciles the set.
export const sendIdsInChunks = async (ids: string[], sendChunk: (chunkIds: string[]) => Promise<unknown>) => {
  for (const chunkIds of chunk(ids, MAX_READ_LIMIT))
    // oxlint-disable-next-line no-await-in-loop -- Committed prefix: a chunk the server rejects stops the ones after it
    await sendChunk(chunkIds);
};
