import { getAttachmentContentDisposition } from "#src/services/azure/container/getAttachmentContentDisposition";
import { describe, expect, test } from "vitest";

describe(getAttachmentContentDisposition, () => {
  test("names a plain file in the extended form", () => {
    expect.hasAssertions();

    expect(getAttachmentContentDisposition("report.pdf")).toBe("attachment; filename*=UTF-8''report.pdf");
  });

  test("a quote, a semicolon and a line break cannot end the name early", () => {
    expect.hasAssertions();

    expect(getAttachmentContentDisposition(`a"; x=1\r\nb`)).toBe("attachment; filename*=UTF-8''a%22%3B%20x%3D1%0D%0Ab");
  });

  test("percent-encodes the characters RFC 5987 leaves outside its attribute set", () => {
    expect.hasAssertions();

    expect(getAttachmentContentDisposition("it's (1)*.txt")).toBe(
      "attachment; filename*=UTF-8''it%27s%20%281%29%2A.txt",
    );
  });

  test("carries a non-ASCII name as its UTF-8 bytes", () => {
    expect.hasAssertions();

    expect(getAttachmentContentDisposition("á.txt")).toBe("attachment; filename*=UTF-8''%C3%A1.txt");
  });
});
