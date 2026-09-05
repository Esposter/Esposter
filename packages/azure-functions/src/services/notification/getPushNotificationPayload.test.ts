import { getPushNotificationPayload } from "#src/services/notification/getPushNotificationPayload";
import { AppNotificationType, NotificationSeverity, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(getPushNotificationPayload, () => {
  const baseUrl = "https://esposter.test";
  const body = "body";
  const icon = "icon";
  const path = "/path";
  const severity = NotificationSeverity.Info;
  const title = "title";
  const type = AppNotificationType.Message;
  const data = { severity, type, url: `${baseUrl}${path}` };

  beforeEach(() => {
    vi.stubEnv("BASE_URL", baseUrl);
  });

  test("makes the deep link absolute against the base url", () => {
    expect.hasAssertions();

    expect(getPushNotificationPayload({ body, icon, path, severity, title, type })).toBe(
      JSON.stringify({ body, data, icon, title }),
    );
  });

  // Undefined keys are dropped by JSON.stringify, so a sender that carries no icon or title sends no such key
  test("omits an absent icon and title", () => {
    expect.hasAssertions();

    expect(getPushNotificationPayload({ body, path, severity, type })).toBe(JSON.stringify({ body, data }));
  });

  // The cap belongs to the payload rather than to each sender, so no notification can exceed it
  test(`truncates the body to ${PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH} characters`, () => {
    expect.hasAssertions();

    const longBody = "a".repeat(PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH + 10);
    // Spelled out rather than computed with `truncate`, which is what the payload uses: an expectation built
    // From the function under test cannot fail on what that function appends, so a stray character in the
    // Suffix would pass unnoticed
    const truncatedBody = `${"a".repeat(PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH - 3)}...`;

    expect(getPushNotificationPayload({ body: longBody, path, severity, type })).toBe(
      JSON.stringify({ body: truncatedBody, data }),
    );
  });
});
