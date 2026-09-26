import { compressContentDelta } from "@/services/resource/compressContentDelta";
import { instantiateZstdEncoder } from "@/services/resource/instantiateZstdEncoder";
import { DEFAULT_COMPRESSION_LEVEL, getWindowLog } from "@esposter/shared";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { readFile } from "node:fs/promises";
import { constants, zstdCompressSync } from "node:zlib";
import { describe, test } from "vitest";

const BENCH_DOCUMENT_BYTE_COUNTS = [1_000_000, 10_000_000];
// Rows of a Sheet-like document, the one resource type that reaches these sizes
const createDocument = (byteCount: number, editedIndex = -1) =>
  new TextEncoder().encode(
    JSON.stringify({
      rows: Array.from({ length: Math.floor(byteCount / 64) }, (_value, index) => ({
        data: { a: index, b: index === editedIndex ? "edited" : `${index % 97}` },
        id: `${index}`,
      })),
    }),
  );
// The generated build against the libzstd node:zlib links, on the same parameters: the committed module is only as
// Fast as the flags it was built with, so a regeneration that loses them drifts from `native` here
describe(compressContentDelta, () => {
  test.for(BENCH_DOCUMENT_BYTE_COUNTS)("%i bytes", async (byteCount, { bench }) => {
    const wasm = await readFile(new URL("../../generated/zstd/zstd.wasm", import.meta.url));
    const zstdEncoder = await instantiateZstdEncoder(wasm);
    const baseline = createDocument(byteCount);
    const content = createDocument(byteCount, 0);
    await bench.compare(
      bench("native", () => {
        zstdCompressSync(content, {
          dictionary: baseline,
          params: {
            [constants.ZSTD_c_compressionLevel]: DEFAULT_COMPRESSION_LEVEL,
            [constants.ZSTD_c_windowLog]: getWindowLog(baseline.byteLength, content.byteLength),
          },
        });
      }),
      bench("wasm", () => {
        compressContentDelta(zstdEncoder, content, baseline);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 3 },
    );
  });
});
