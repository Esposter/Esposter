import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@/services/constants";
import { getCreateMessageNotificationPayload } from "@/services/getCreateMessageNotificationPayload";
import { InvocationContext } from "@azure/functions";
import { assert, describe, expect, test } from "vitest";

describe(getCreateMessageNotificationPayload, () => {
  const context = new InvocationContext();
  const url = "url";
  const icon = "icon";
  const title = "title";

  test("returns undefined when message has no text content", () => {
    expect.hasAssertions();

    const result = getCreateMessageNotificationPayload(context, "<p></p>", { url });

    expect(result).toBeUndefined();
  });

  test("returns undefined when message is empty", () => {
    expect.hasAssertions();

    const result = getCreateMessageNotificationPayload(context, "", { url });

    expect(result).toBeUndefined();
  });

  test("extracts text from paragraph and serializes payload", () => {
    expect.hasAssertions();

    const result = getCreateMessageNotificationPayload(context, "<p>a</p>", { icon, title, url });

    expect(result).toBe(JSON.stringify({ body: "a", data: { url }, icon, title }));
  });

  test("extracts text from plain-text webhook content without a paragraph wrapper", () => {
    expect.hasAssertions();

    const result = getCreateMessageNotificationPayload(context, "a", { icon, title, url });

    expect(result).toBe(JSON.stringify({ body: "a", data: { url }, icon, title }));
  });

  test(`truncates body to ${PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH} characters`, () => {
    expect.hasAssertions();

    const longText = "a".repeat(PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH + 10);
    const result = getCreateMessageNotificationPayload(context, `<p>${longText}</p>`, { url });

    assert.exists(result);
    const parsed = JSON.parse(result);

    expect(parsed.body.length).toBeLessThanOrEqual(PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH);
  });
});
