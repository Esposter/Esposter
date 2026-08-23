import { streamToText } from "#src/util/text/streamToText";
import { Readable } from "node:stream";
import { describe, expect, test } from "vitest";

describe(streamToText, () => {
  test("empty string", async () => {
    expect.hasAssertions();

    const text = await streamToText(Readable.from(""));

    expect(text).toBe("");
  });
});
