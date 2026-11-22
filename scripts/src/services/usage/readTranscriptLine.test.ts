import { readTranscriptLine } from "#src/services/usage/readTranscriptLine";
import { describe, expect, test, vi } from "vitest";

describe(readTranscriptLine, () => {
  test("logs a complete line the schema refuses, and reads it as absent", () => {
    expect.hasAssertions();

    const error = vi.spyOn(console, "error").mockReturnValue(undefined);

    expect(readTranscriptLine(JSON.stringify({ message: { usage: { input_tokens: "" } } }))).toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
  });
});
