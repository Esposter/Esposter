import { getShareMessage } from "@/services/resource/getShareMessage";
import { describe, expect, test } from "vitest";

describe(getShareMessage, () => {
  const url = "https://esposter.test/view/Survey/id";
  const note = "note";

  test("sends the bare link with no note", () => {
    expect.hasAssertions();

    expect(getShareMessage("", url)).toBe(url);
  });

  test("sends the bare link for a whitespace-only note", () => {
    expect.hasAssertions();

    expect(getShareMessage(" ", url)).toBe(url);
  });

  test("puts the link on its own line beneath the note", () => {
    expect.hasAssertions();

    expect(getShareMessage(note, url)).toBe(`${note}\n${url}`);
  });

  test("normalizes the note before sending", () => {
    expect.hasAssertions();

    expect(getShareMessage(` ${note} `, url)).toBe(`${note}\n${url}`);
  });
});
