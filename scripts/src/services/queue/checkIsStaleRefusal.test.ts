import { checkIsStaleRefusal } from "#src/services/queue/checkIsStaleRefusal";
import { describe, expect, test } from "vitest";

describe(checkIsStaleRefusal, () => {
  test("reads a non-fast-forward or fetch-first refusal as stale", () => {
    expect.hasAssertions();

    expect(checkIsStaleRefusal(" ! [rejected]        HEAD -> ai/queue (non-fast-forward)")).toBe(true);
    expect(checkIsStaleRefusal(" ! [rejected]        HEAD -> ai/queue (fetch first)")).toBe(true);
  });

  test("reads any other push failure as not stale", () => {
    expect.hasAssertions();

    expect(checkIsStaleRefusal("fatal: Could not read from remote repository.")).toBe(false);
  });
});
