import { streamToText } from "@/util/text/streamToText";
import { Readable } from "node:stream";
import { describe, expect, test } from "vitest";

describe(streamToText, () => {
  test("empty string", async () => {
    expect.hasAssertions();

    await expect(streamToText(Readable.from(""))).resolves.toBe("");
  });
});
