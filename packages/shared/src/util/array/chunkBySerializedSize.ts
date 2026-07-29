// Greedy chunking against a serialized-JSON byte budget, and optionally a count, for every payload an API caps by
// Request size — Event Grid's 1 MB event and its 1 MB publish request both. Bytes cannot be inferred from a count:
// The items are user text (a filename, an event payload), so one chunk of maximal CJK or emoji serializes to
// Several times the size of the same count in ASCII, and a count-only bound ships requests the service rejects.
// An item that exceeds the budget on its own still gets its own chunk: dropping it would silently strand whatever
// It named, and one oversized item failing loudly is the better of the two.
export const chunkBySerializedSize = <T>(items: T[], maxBytes: number, maxCount?: number): T[][] => {
  const chunks: T[][] = [];
  let currentChunk: T[] = [];
  let currentBytes = 0;
  for (const item of items) {
    // The serialized cost of one array element: the item as JSON — every quote and escape included — plus the
    // Separating comma. Measuring the raw value undercounts, since a quote, a backslash or a control character
    // Costs two to six bytes once serialized, and a value made of them outgrows the budget the check just cleared
    const itemBytes = Buffer.byteLength(JSON.stringify(item), "utf8") + 1;
    if (currentChunk.length > 0 && (currentChunk.length === maxCount || currentBytes + itemBytes > maxBytes)) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentBytes = 0;
    }

    currentChunk.push(item);
    currentBytes += itemBytes;
  }

  if (currentChunk.length > 0) chunks.push(currentChunk);
  return chunks;
};
