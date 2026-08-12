import type { UserStatusInMessage } from "@esposter/db-schema";

import { getDetectedUserStatus } from "@@/server/services/message/getDetectedUserStatus";
import { UserStatus, UserStatuses } from "@esposter/db-schema";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getDetectedUserStatus, () => {
  const createdAt = new Date();
  const createStatus = (overrides: Partial<UserStatusInMessage> = {}): UserStatusInMessage => ({
    createdAt,
    deletedAt: null,
    expiresAt: new Date(1),
    isConnected: true,
    message: "message",
    status: UserStatus.DoNotDisturb,
    updatedAt: createdAt,
    userId: crypto.randomUUID(),
    ...overrides,
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test.each(UserStatuses)("reports a %s the member chose and has not expired as itself", (status) => {
    expect.hasAssertions();

    expect(getDetectedUserStatus(createStatus({ status }))).toBe(status);
  });

  // A status the member never set and one whose window has closed are the same thing to the reader: neither is a
  // Choice any more, so both fall back to whether the socket is up
  test.each([
    ["expired", { expiresAt: new Date(0) }],
    ["removed", { status: null }],
  ] as [string, Partial<UserStatusInMessage>][])(
    "detects a %s status from the connection alone",
    (_description, overrides) => {
      expect.hasAssertions();

      expect(getDetectedUserStatus(createStatus({ ...overrides, isConnected: true }))).toBe(UserStatus.Online);
      expect(getDetectedUserStatus(createStatus({ ...overrides, isConnected: false }))).toBe(UserStatus.Offline);
    },
  );
});
