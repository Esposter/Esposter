import { getGeneratedFileName } from "#src/services/voiceMatch/getGeneratedFileName";
import { describe, expect, test } from "vitest";

describe(getGeneratedFileName, () => {
  test("replaces a colon, which Windows would read as an alternate data stream", () => {
    expect.hasAssertions();

    expect(getGeneratedFileName("en-au-andrew:DragonHDOmniLatestNeural")).toBe(
      "en-au-andrew-DragonHDOmniLatestNeural.json",
    );
  });
});
