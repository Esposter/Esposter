import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { TEST_RICH_TEXT } from "#src/services/constants.test";
import { readMjmlContent } from "#src/services/readMjmlContent";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { parse } from "node-html-parser";
import { assert, describe, test } from "vitest";

// A quadratic read would grow a hundredfold from the first size to the last, which the report makes visible
const OPENING_COUNTS = [1000, 10000, 100000];
// A closed element at the end makes the label hold an element, so the same run takes the other branch of the read
const CLOSED_TAG = "<b>bold</b>";

// Built the way the unit test builds a label, so the bench reads the element the test reads
const createLabelElement = (content: string) => {
  const [element] = parse(`<mj-button>${content}</mj-button>`, { blockTextElements: { "mj-button": true } }).children;
  assert(element);
  return element;
};

// One group per size, so `vs base` compares only the shape of the input at a fixed length
describe(readMjmlContent, () => {
  test.for(OPENING_COUNTS)("%i unclosed openings", async (openingCount, { bench }) => {
    const unclosedElement = createLabelElement("<a".repeat(openingCount));
    const tagEndElement = createLabelElement(`${"<a".repeat(openingCount)}${CLOSED_TAG}`);
    await bench.compare(
      bench("a run of unclosed openings", () =>
        readMjmlContent(unclosedElement, MjmlContentKind.Label, TEST_RICH_TEXT)),
      bench("the same run ending in a real tag", () =>
        readMjmlContent(tagEndElement, MjmlContentKind.Label, TEST_RICH_TEXT)),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
