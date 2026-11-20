import { chunk, MAX_READ_LIMIT } from "@esposter/shared";

// Sends the ids to the server a call at a time, each chunk at the server's per-call cap and in the order given.
// The rows every call returns are answered together, in the same order.
// A chunk the server rejects stops the ones after it.
// The ones before it stay committed, so the caller reconciles the set.
export const sendIdsInChunks = async <TRow>(
  ids: string[],
  sendChunk: (chunkIds: string[]) => Promise<TRow[]>,
): Promise<TRow[]> => {
  const rows: TRow[] = [];
  for (const chunkIds of chunk(ids, MAX_READ_LIMIT))
    // oxlint-disable-next-line no-await-in-loop -- Committed prefix: a chunk the server rejects stops the ones after it
    rows.push(...(await sendChunk(chunkIds)));
  return rows;
};
