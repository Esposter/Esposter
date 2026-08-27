import { checkIsSameDevice } from "@@/server/services/auth/checkIsSameDevice";
import { getMockSession } from "@@/server/trpc/context.test";
import { describe, expect, test } from "vitest";

describe(checkIsSameDevice, () => {
  test("same", () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();

    expect(checkIsSameDevice({ sessionId: session.id, userId: user.id }, { session, user })).toBe(true);
  });

  test("different", () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();

    expect(
      checkIsSameDevice(
        { sessionId: session.id, userId: user.id },
        { session: { ...session, id: crypto.randomUUID() }, user },
      ),
    ).toBe(false);
  });
});
