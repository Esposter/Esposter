import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A declaration file's worth of text at the sizes the store holds — a leaf module, a library's bundled types, and
// `lib.dom.d.ts` — so the per-byte cost of the tokenizer is visible above the fixed cost of a call. The shapes
// Drive the regex differently: prose is long runs of short words, code is punctuation between identifiers, and a
// Single identifier is the degenerate case with one match
const BENCH_BYTE_COUNTS = [10_000, 100_000, 1_000_000];
const getText = (unit: string, byteCount: number) =>
  unit.repeat(Math.ceil(byteCount / unit.length)).slice(0, byteCount);

describe(addWords, () => {
  test.for(BENCH_BYTE_COUNTS)("%i bytes", async (byteCount, { bench }) => {
    const prose = getText("a b ", byteCount);
    const code = getText("export declare const a: (b: c) => d;\n", byteCount);
    const identifier = getText("a", byteCount);
    await bench.compare(
      bench("prose", () => {
        addWords(new Set(), prose);
      }),
      bench("code", () => {
        addWords(new Set(), code);
      }),
      bench("one identifier", () => {
        addWords(new Set(), identifier);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
