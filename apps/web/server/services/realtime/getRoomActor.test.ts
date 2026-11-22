import type { AuthSession } from "#server/models/auth/AuthSession";

import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { DEVICE_ID_HEADER } from "#shared/services/realtime/constants";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getRoomActor, () => {
  const userId = v7();
  const authSession = { session: {}, user: { id: userId } } as AuthSession;

  test("names the tab that made the write, so its own socket is not sent the echo", () => {
    expect.hasAssertions();

    const deviceId = v7();
    expect(
      getRoomActor({ headers: new Headers({ [DEVICE_ID_HEADER]: deviceId }), user: authSession.user }),
    ).toStrictEqual({ deviceId, userId });
  });

  test("names no tab when the header is not a device id, so a forged value cannot pick a socket to exclude", () => {
    expect.hasAssertions();

    expect(
      getRoomActor({ headers: new Headers({ [DEVICE_ID_HEADER]: "device-tag:user:admin" }), user: authSession.user }),
    ).toStrictEqual({ userId });
  });
});
