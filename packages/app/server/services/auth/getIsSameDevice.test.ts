import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { describe, expect, test } from "vitest";

describe(getIsSameDevice, () => {
  const createdAt = new Date();
  const sessionId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  test("same", () => {
    expect.hasAssertions();

    expect(
      getIsSameDevice(
        { sessionId, userId },
        {
          session: {
            createdAt,
            expiresAt: createdAt,
            id: sessionId,
            ipAddress: "",
            token: "",
            updatedAt: createdAt,
            userAgent: "",
            userId,
          },
          user: {
            createdAt,
            email: "",
            emailVerified: false,
            id: userId,
            image: "",
            name: "",
            updatedAt: createdAt,
          },
        },
      ),
    ).toBe(true);
  });

  test("different", () => {
    expect.hasAssertions();

    const device = { sessionId, userId };
    const session = {
      session: {
        createdAt,
        expiresAt: createdAt,
        id: sessionId,
        ipAddress: "",
        token: "",
        updatedAt: createdAt,
        userAgent: "",
        userId: "",
      },
      user: { createdAt, email: "", emailVerified: false, id: "", image: "", name: "", updatedAt: createdAt },
    };

    expect(getIsSameDevice(device, session)).toBe(false);
  });
});
