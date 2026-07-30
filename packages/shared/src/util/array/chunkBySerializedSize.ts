// Greedy chunking against a serialized-JSON byte budget and a count, for every payload an API caps by request
// Size — Event Grid's 1 MB event and its 1 MB publish request both. Neither bound implies the other: the items are
// User text (a filename, an event payload), so one chunk of maximal CJK or emoji serializes to several times the
// Size of the same count in ASCII, while a blob of many tiny events clears the byte budget and is still rejected
// Whole at the service's event limit — so both are required rather than optional.
// An item that exceeds the budget on its own still gets its own chunk: dropping it would silently strand whatever
// It named, and one oversized item failing loudly is the better of the two.
// Byte length is measured with TextEncoder rather than Buffer: this package is imported by the browser bundle,
// Where the Node global does not exist
// What a serialized array costs beyond its items: the two enclosing brackets, less the separating comma the
// Per-item cost below charges the first item, which has nothing to separate it from. Charged to every chunk up
// Front, so a chunk filled exactly to the budget serializes to the budget rather than one byte past it — and one
// Byte past a request cap is rejected exactly as whole as a megabyte past it
const ARRAY_SERIALIZATION_BYTES = 1;

export const chunkBySerializedSize = <T>(items: T[], maxBytes: number, maxCount: number): T[][] => {
  const textEncoder = new TextEncoder();
  const chunks: T[][] = [];
  let currentChunk: T[] = [];
  let currentBytes = ARRAY_SERIALIZATION_BYTES;
  for (const item of items) {
    // The serialized cost of one array element: the item as JSON — every quote and escape included — plus the
    // Separating comma. Measuring the raw value undercounts, since a quote, a backslash or a control character
    // Costs two to six bytes once serialized, and a value made of them outgrows the budget the check just cleared
    const itemBytes = textEncoder.encode(JSON.stringify(item)).length + 1;
    if (currentChunk.length > 0 && (currentChunk.length === maxCount || currentBytes + itemBytes > maxBytes)) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentBytes = ARRAY_SERIALIZATION_BYTES;
    }

    currentChunk.push(item);
    currentBytes += itemBytes;
  }

  if (currentChunk.length > 0) chunks.push(currentChunk);
  return chunks;
};
