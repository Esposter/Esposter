import { parseXmlString } from "#src/services/parseXmlString";
import { describe, expect, test } from "vitest";

describe(parseXmlString, () => {
  test("rejects a document with no root element rather than returning nothing to read", async () => {
    expect.hasAssertions();

    await expect(parseXmlString("")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseXmlString, has no root element]`,
    );
  });
});
