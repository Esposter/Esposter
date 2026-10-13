import { readChannelLine } from "#src/services/readChannelLine";
import { describe, expect, test } from "vitest";

describe(readChannelLine, () => {
  test("reads the trimmed text of a line", () => {
    expect.hasAssertions();

    expect(readChannelLine(JSON.stringify({ text: "  hello  " }))).toBe("hello");
  });

  test.each(["", "not json", JSON.stringify({ text: "   " }), JSON.stringify({ text: 1 }), "null"])(
    "rejects %j",
    (body) => {
      expect.hasAssertions();

      expect(readChannelLine(body)).toBeUndefined();
    },
  );
});
