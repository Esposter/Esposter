import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { describe, expect, test } from "vitest";

// The note every reply carries, and the reason the reply cannot be read for the words "already reviewed"
const NOTE =
  "> Note: CodeRabbit is an incremental review system and does not re-review already reviewed commits. This command is applicable only when automatic reviews are paused.";

const getReply = (summary: string, status: string): string =>
  `<!-- This is an auto-generated reply by CodeRabbit -->\n<details>\n<summary>${summary}</summary>\n\n${status}\n\n${NOTE}\n\n</details>`;

describe(checkIsSlotFree, () => {
  test("frees the slot when the bot answers that it is rate limited", () => {
    expect.hasAssertions();

    expect(checkIsSlotFree(getReply("⚠️ Action not completed", "Review rate limited."))).toBe(true);
  });

  // The reply announcing a review that has just started carries the same note as every other
  test("holds the slot when the probe started a review", () => {
    expect.hasAssertions();

    expect(checkIsSlotFree(getReply("✅ Action performed", "Review finished."))).toBe(false);
  });

  test("holds the slot when the pull request is closed", () => {
    expect.hasAssertions();

    expect(checkIsSlotFree(getReply("⚠️ Action not completed", "Pull request is closed."))).toBe(false);
  });
});
