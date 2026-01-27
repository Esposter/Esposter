import { getDeviceId } from "@@/server/services/auth/getDeviceId";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getDeviceId, () => {
  const sessionId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  test("gets", () => {
    expect.hasAssertions();

    expect(getDeviceId({ sessionId, userId })).toBe(`${userId}${ID_SEPARATOR}${sessionId}`);
  });
});
