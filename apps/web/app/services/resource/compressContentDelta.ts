import type { ZstdEncoder } from "@/models/resource/ZstdEncoder";

import { DEFAULT_COMPRESSION_LEVEL, getWindowLog, InvalidOperationError, Operation } from "@esposter/shared";

// The new document as a zstd frame with the stored one as its dictionary — the version store's delta, moved onto
// The wire, with the same level and a window derived the same way, so the server's node:zlib reads it unchanged
export const compressContentDelta = (
  zstdEncoder: ZstdEncoder,
  content: Uint8Array,
  baseline: Uint8Array,
): Uint8Array<ArrayBuffer> => {
  const { compressWithDictionary, free, malloc, memory, ZSTD_compressBound, ZSTD_isError } = zstdEncoder;
  const capacity = ZSTD_compressBound(content.byteLength);
  const sourcePointer = malloc(content.byteLength);
  const dictionaryPointer = malloc(baseline.byteLength);
  const destinationPointer = malloc(capacity);
  // Viewed after every allocation, since a malloc that grows the memory detaches every view taken before it
  new Uint8Array(memory.buffer, sourcePointer, content.byteLength).set(content);
  new Uint8Array(memory.buffer, dictionaryPointer, baseline.byteLength).set(baseline);
  const size = compressWithDictionary(
    destinationPointer,
    capacity,
    sourcePointer,
    content.byteLength,
    dictionaryPointer,
    baseline.byteLength,
    DEFAULT_COMPRESSION_LEVEL,
    getWindowLog(baseline.byteLength, content.byteLength),
  );
  // An error is a code in the size's place, so it is read before the size is used as a length
  const delta = ZSTD_isError(size) ? undefined : new Uint8Array(memory.buffer, destinationPointer, size).slice();
  free(sourcePointer);
  free(dictionaryPointer);
  free(destinationPointer);
  if (!delta) throw new InvalidOperationError(Operation.Create, compressContentDelta.name, `zstd error ${size}`);
  return delta;
};
