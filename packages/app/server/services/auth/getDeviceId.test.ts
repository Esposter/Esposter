// @vitest-environment node
import { getDeviceId } from "@@/server/services/auth/getDeviceId";
import { getMockSession } from "@@/server/trpc/context.test";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getDeviceId, () => {
  test("gets", () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();

    expect(getDeviceId({ sessionId: session.id, userId: user.id })).toBe(`${user.id}${ID_SEPARATOR}${session.id}`);
  });
});
