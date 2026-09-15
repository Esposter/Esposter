import type { CitingPage } from "#src/models/citations/CitingPage";

import { getStaleNames } from "#src/services/sweeps/staleNames/getStaleNames";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The citing trees at the page counts they hold — one area, the docs, every tree — each page citing a hundred
// Names, against a source-name set the size the store gives. The shapes stress the filters differently: a page
// Of names the source holds pays every regex before the set lookup passes, a page of stale names pays the
// Member-access split as well, and a page of paths is dropped by the first regex
const BENCH_PAGE_COUNTS = [10, 100, 1000];
const NAMES_PER_PAGE = 100;
const SOURCE_NAME_COUNT = 300_000;
const sourceNames = new Set(Array.from({ length: SOURCE_NAME_COUNT }, (_value, index) => `a${index}B`));
const getPages = (unit: (index: number) => string, pageCount: number): CitingPage[] =>
  Array.from({ length: pageCount }, (_page, pageIndex) => ({
    path: String(pageIndex),
    text: Array.from({ length: NAMES_PER_PAGE }, (_name, index) => `\`${unit(index)}\``).join(" "),
  }));

describe(getStaleNames, () => {
  test.for(BENCH_PAGE_COUNTS)("%i pages", async (pageCount, { bench }) => {
    const heldNames = getPages((index) => `a${index}B`, pageCount);
    const staleNames = getPages((index) => `a${index}C.d`, pageCount);
    const paths = getPages((index) => `a/${index}`, pageCount);
    await bench.compare(
      bench("names the source holds", () => {
        getStaleNames(heldNames, sourceNames);
      }),
      bench("stale member accesses", () => {
        getStaleNames(staleNames, sourceNames);
      }),
      bench("paths", () => {
        getStaleNames(paths, sourceNames);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
