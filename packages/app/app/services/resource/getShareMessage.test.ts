import { getShareMessage } from "@/services/resource/getShareMessage";
import { describe, expect, test } from "vitest";

describe(getShareMessage, () => {
  const url = "https://esposter.test/view/Survey/id";
  const note = "note";
  const link = `<p><a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a></p>`;

  test("sends the bare link with no note", () => {
    expect.hasAssertions();

    expect(getShareMessage("", url)).toBe(link);
  });

  test("sends the bare link for a whitespace-only note", () => {
    expect.hasAssertions();

    expect(getShareMessage(" ", url)).toBe(link);
  });

  test("puts the note in its own paragraph above the link", () => {
    expect.hasAssertions();

    expect(getShareMessage(note, url)).toBe(`<p>${note}</p>${link}`);
  });

  test("normalizes the note before sending", () => {
    expect.hasAssertions();

    expect(getShareMessage(` ${note} `, url)).toBe(`<p>${note}</p>${link}`);
  });

  test("renders line breaks and escapes angle brackets in the note", () => {
    expect.hasAssertions();

    expect(getShareMessage("a\nb<c", url)).toBe(`<p>a<br />b&lt;c</p>${link}`);
  });
});
