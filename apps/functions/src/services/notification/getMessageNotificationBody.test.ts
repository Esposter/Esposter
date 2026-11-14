import { getMessageNotificationBody } from "#src/services/notification/getMessageNotificationBody";
import { describe, expect, test } from "vitest";

describe(getMessageNotificationBody, () => {

  test("returns undefined when message has no text content", () => {
    expect.hasAssertions();

    expect(getMessageNotificationBody("<p></p>")).toBeUndefined();
    expect(getMessageNotificationBody("")).toBeUndefined();
  });

  test("extracts text from the first paragraph", () => {
    expect.hasAssertions();

    expect(getMessageNotificationBody("<p>a</p><p>b</p>")).toBe("a");
  });

  test("masks a spoiler's text", () => {
    expect.hasAssertions();

    expect(getMessageNotificationBody(`<p>a <span data-spoiler="">secret</span></p>`)).toBe("a ▇▇▇▇");
  });

  test("extracts text from plain-text webhook content without a paragraph wrapper", () => {
    expect.hasAssertions();

    expect(getMessageNotificationBody("a")).toBe("a");
  });
});
