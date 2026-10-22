import { getSessionFailure } from "#src/services/review/getSessionFailure";
import { describe, expect, test } from "vitest";

describe(getSessionFailure, () => {
  const REFUSAL = "Failed to authenticate: OAuth session expired";

  test("reads the refusal out of the envelope's result, which stderr does not carry", () => {
    expect.hasAssertions();

    expect(getSessionFailure(JSON.stringify({ is_error: true, result: REFUSAL, type: "result" }), "")).toBe(REFUSAL);
  });

  test("reads a launch that wrote no envelope from stderr", () => {
    expect.hasAssertions();

    expect(getSessionFailure("", "ERR_PNPM_RUN_FAILED\n")).toBe("ERR_PNPM_RUN_FAILED");
  });
});
