import type { CitingPage } from "#src/models/citations/CitingPage";

import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The docs and skills at the page counts they hold — one area, one tree, both — each page a thousand words. The
// Shapes stress the index differently: distinct pages share nothing and every shingle is one entry, paired pages
// Share every shingle with exactly one other and every one is a run to merge, and one text on every page is the
// Template case, every shingle held by them all and none reported
const BENCH_PAGE_COUNTS = [10, 100, 500];
const WORDS_PER_PAGE = 1000;
const getText = (pageIndex: number) =>
  Array.from({ length: WORDS_PER_PAGE }, (_value, index) => `a${pageIndex}b${index}`).join(" ");
const getPages = (getPageText: (pageIndex: number) => string, pageCount: number): CitingPage[] =>
  Array.from({ length: pageCount }, (_value, pageIndex) => ({ path: String(pageIndex), text: getPageText(pageIndex) }));

describe(getDuplicateProse, () => {
  test.for(BENCH_PAGE_COUNTS)("%i pages", async (pageCount, { bench }) => {
    const distinctPages = getPages(getText, pageCount);
    const pairedPages = getPages((pageIndex) => getText(Math.floor(pageIndex / 2)), pageCount);
    const templatePages = getPages(() => getText(0), pageCount);
    await bench.compare(
      bench("distinct", () => {
        getDuplicateProse(distinctPages);
      }),
      bench("paired", () => {
        getDuplicateProse(pairedPages);
      }),
      bench("one template", () => {
        getDuplicateProse(templatePages);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
