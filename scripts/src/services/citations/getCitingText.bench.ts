import { getCitingText } from "#src/services/citations/getCitingText";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A page at the sizes the citing trees hold — a short reference page, a long skill, the widest docs page — with
// The shapes that drive the run walk differently: prose citing one path per line is one closer found per
// Opener, a page of fences is spans skipped in blocks, and a page of double-backtick spans is the worst case,
// Each opener's closer found by a scan across every run after it
const BENCH_BYTE_COUNTS = [1000, 10_000, 100_000];
const getText = (unit: string, byteCount: number) =>
  unit.repeat(Math.ceil(byteCount / unit.length)).slice(0, byteCount);

describe(getCitingText, () => {
  test.for(BENCH_BYTE_COUNTS)("%i bytes", async (byteCount, { bench }) => {
    const prose = getText("a `b` c\n", byteCount);
    const fences = getText("```\na\n```\n", byteCount);
    const spans = getText("``a `b` c`` ", byteCount);
    await bench.compare(
      bench("prose", () => {
        getCitingText(prose);
      }),
      bench("fences", () => {
        getCitingText(fences);
      }),
      bench("double-backtick spans", () => {
        getCitingText(spans);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
