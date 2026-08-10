import { getPushNotificationPayload } from "@/services/getPushNotificationPayload";
import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { truncate } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getPushNotificationPayload, () => {
  const baseUrl = "https://esposter.test";
  const body = "body";
  const icon = "icon";
  const path = "/path";
  const title = "title";

  beforeEach(() => {
    vi.stubEnv("BASE_URL", baseUrl);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("makes the deep link absolute against the base url", () => {
    expect.hasAssertions();

    expect(getPushNotificationPayload({ body, icon, path, title })).toBe(
      JSON.stringify({ body, data: { url: `${baseUrl}${path}` }, icon, title }),
    );
  });

  // Undefined keys are dropped by JSON.stringify, so a sender that carries no icon or title sends no such key
  test("omits an absent icon and title", () => {
    expect.hasAssertions();

    expect(getPushNotificationPayload({ body, path })).toBe(
      JSON.stringify({ body, data: { url: `${baseUrl}${path}` } }),
    );
  });

  // The cap belongs to the payload rather than to each sender, so no notification can exceed it
  test(`truncates the body to ${PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH} characters`, () => {
    expect.hasAssertions();

    const longBody = "a".repeat(PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH + 10);

    expect(getPushNotificationPayload({ body: longBody, path })).toBe(
      JSON.stringify({
        body: truncate(longBody, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH),
        data: { url: `${baseUrl}${path}` },
      }),
    );
  });
});
