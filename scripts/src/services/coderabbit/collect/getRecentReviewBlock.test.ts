import { RECENT_REVIEW_END_MARKER, RECENT_REVIEW_START_MARKER } from "#src/services/coderabbit/collect/constants";
import { getRecentReviewBlock } from "#src/services/coderabbit/collect/getRecentReviewBlock";
import { describe, expect, test } from "vitest";

describe(getRecentReviewBlock, () => {
  // The rate-limit section of the same comment names the range the bot skipped, so what sits outside the markers
  // Is dropped with it
  test.each([
    ["the block alone", `${RECENT_REVIEW_START_MARKER} ${RECENT_REVIEW_END_MARKER}`, " "],
    ["nothing outside the markers", ` ${RECENT_REVIEW_START_MARKER}${RECENT_REVIEW_END_MARKER} `, ""],
    ["undefined without the markers", "", undefined],
  ])("returns %s", (_, body, block) => {
    expect.hasAssertions();

    expect(getRecentReviewBlock(body)).toBe(block);
  });
});
