import { MAX_WINDOW_LOG, MIN_WINDOW_LOG } from "#src/constants";

// The window must span the dictionary and the input together or the encoder cannot match across them, and
// The failure is silent and severe: at a fixed small window a multi-megabyte document encodes to hundreds of
// Kilobytes where a window wide enough for both produces a few. Computed per write from the combined size and
// Clamped into zstd's own range, then recorded in the header so the decoder can admit the frame
export const getWindowLog = (dictionaryByteCount: number, inputByteCount: number): number =>
  Math.min(MAX_WINDOW_LOG, Math.max(MIN_WINDOW_LOG, Math.ceil(Math.log2(dictionaryByteCount + inputByteCount + 1))));
