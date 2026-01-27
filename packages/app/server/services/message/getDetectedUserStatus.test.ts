import { getDetectedUserStatus } from "@@/server/services/message/getDetectedUserStatus";
import { UserStatus } from "@esposter/db-schema";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getDetectedUserStatus, () => {
  const createdAt = new Date();
  const message = "message";
  const userId = crypto.randomUUID();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("valid defined status", () => {
    expect.hasAssertions();

    for (const status of Object.values(UserStatus))
      expect(
        getDetectedUserStatus({
          createdAt,
          deletedAt: null,
          expiresAt: new Date(1),
          isConnected: true,
          message,
          status,
          updatedAt: createdAt,
          userId,
        }),
      ).toBe(status);
  });

  test("expired defined status auto-detects status based on isConnected", () => {
    expect.hasAssertions();

    expect(
      getDetectedUserStatus({
        createdAt,
        deletedAt: null,
        expiresAt: new Date(0),
        isConnected: true,
        message,
        status: UserStatus.DoNotDisturb,
        updatedAt: createdAt,
        userId,
      }),
    ).toBe(UserStatus.Online);
    expect(
      getDetectedUserStatus({
        createdAt,
        deletedAt: null,
        expiresAt: new Date(0),
        isConnected: false,
        message,
        status: UserStatus.DoNotDisturb,
        updatedAt: createdAt,
        userId,
      }),
    ).toBe(UserStatus.Offline);
  });

  test("removed status auto-detects status based on isConnected", () => {
    expect.hasAssertions();

    expect(
      getDetectedUserStatus({
        createdAt,
        deletedAt: null,
        expiresAt: new Date(1),
        isConnected: true,
        message,
        status: null,
        updatedAt: createdAt,
        userId,
      }),
    ).toBe(UserStatus.Online);
    expect(
      getDetectedUserStatus({
        createdAt,
        deletedAt: null,
        expiresAt: new Date(1),
        isConnected: false,
        message,
        status: null,
        updatedAt: createdAt,
        userId,
      }),
    ).toBe(UserStatus.Offline);
  });
});
