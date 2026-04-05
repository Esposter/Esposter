// @vitest-environment node
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { getMockSession } from "@@/server/trpc/context.test";
import { describe, expect, test } from "vitest";

describe(getIsSameDevice, () => {
  test("same", () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();

    expect(getIsSameDevice({ sessionId: session.id, userId: user.id }, { session, user })).toBe(true);
  });

  test("different", () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();

    expect(
      getIsSameDevice(
        { sessionId: session.id, userId: user.id },
        { session: { ...session, id: crypto.randomUUID() }, user },
      ),
    ).toBe(false);
  });
});
