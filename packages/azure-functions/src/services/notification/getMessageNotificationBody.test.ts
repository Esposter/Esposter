import { getMessageNotificationBody } from "#src/services/notification/getMessageNotificationBody";
import { InvocationContext } from "@azure/functions";
import { describe, expect, test } from "vitest";

describe(getMessageNotificationBody, () => {
  const context = new InvocationContext();

  test("returns undefined when message has no text content", () => {
    expect.hasAssertions();

    expect(getMessageNotificationBody(context, "<p></p>")).toBeUndefined();
    expect(getMessageNotificationBody(context, "")).toBeUndefined();
  });

  test("extracts text from the first paragraph", () => {
    expect.hasAssertions();

    expect(getMessageNotificationBody(context, "<p>a</p><p>b</p>")).toBe("a");
  });

  test("extracts text from plain-text webhook content without a paragraph wrapper", () => {
    expect.hasAssertions();

    expect(getMessageNotificationBody(context, "a")).toBe("a");
  });
});
