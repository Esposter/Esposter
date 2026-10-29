import { MAX_LANDING_ATTEMPTS } from "#src/services/land/constants";
import { waitBeforeRetry } from "#src/services/land/waitBeforeRetry";
import { describe, expect, test } from "vitest";

describe(waitBeforeRetry, () => {
  // A push the remote turned down opens with a `To <url>` header, and the refusal is the `! [rejected]` line after it
  test("throws the refusal of a push that is out of attempts, not the header that opens its output", async () => {
    expect.hasAssertions();

    const stderr = [
      "To https://github.com/Esposter/Esposter.git",
      " ! [rejected]        HEAD -> ai/queue (fetch first)",
      "error: failed to push some refs to 'https://github.com/Esposter/Esposter.git'",
    ].join("\n");

    await expect(
      waitBeforeRetry(stderr, MAX_LANDING_ATTEMPTS, MAX_LANDING_ATTEMPTS),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: ai/queue, ! [rejected]        HEAD -> ai/queue (fetch first)]`,
    );
  });
});
