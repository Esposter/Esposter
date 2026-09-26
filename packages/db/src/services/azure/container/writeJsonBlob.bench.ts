import { JSON_BLOB_COMPRESSION_LEVEL, MAX_CONTENT_ENCODING_WINDOW_LOG } from "#src/services/azure/container/constants";
import { writeJsonBlob } from "#src/services/azure/container/writeJsonBlob";
import { DEFAULT_COMPRESSION_LEVEL } from "@esposter/shared";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { promisify } from "node:util";
import { constants, zstdCompress } from "node:zlib";
import { describe, test } from "vitest";

const BENCH_DOCUMENT_BYTE_COUNTS = [100_000, 10_000_000];
// Zstd's own default, between the level a JSON blob takes and the one the version store spends
const ZSTD_DEFAULT_COMPRESSION_LEVEL = 3;
const compress = promisify(zstdCompress);
// Rows of a Sheet-shaped document, the one resource type that reaches these sizes: a random id per row, as an
// Import mints, and values that repeat
const createDocument = (byteCount: number) =>
  JSON.stringify({
    rows: Array.from({ length: Math.floor(byteCount / 100) }, (_value, index) => ({
      data: { a: index, b: `${index % 97}` },
      id: crypto.randomUUID(),
    })),
  });
// The level is what this settles, so each task compresses the same document the writer does at one candidate:
// The writer's own, zstd's default, and the version store's
describe(writeJsonBlob, () => {
  test.for(BENCH_DOCUMENT_BYTE_COUNTS)("%i bytes", async (byteCount, { bench }) => {
    const serializedContent = createDocument(byteCount);
    const compressAtLevel = (level: number) =>
      compress(serializedContent, {
        params: {
          [constants.ZSTD_c_compressionLevel]: level,
          [constants.ZSTD_c_windowLog]: MAX_CONTENT_ENCODING_WINDOW_LOG,
        },
      });
    await bench.compare(
      bench(`level ${JSON_BLOB_COMPRESSION_LEVEL}`, async () => {
        await compressAtLevel(JSON_BLOB_COMPRESSION_LEVEL);
      }),
      bench(`level ${ZSTD_DEFAULT_COMPRESSION_LEVEL}`, async () => {
        await compressAtLevel(ZSTD_DEFAULT_COMPRESSION_LEVEL);
      }),
      bench(`level ${DEFAULT_COMPRESSION_LEVEL}`, async () => {
        await compressAtLevel(DEFAULT_COMPRESSION_LEVEL);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: byteCount < 1_000_000 ? 10 : 3 },
    );
  });
});
