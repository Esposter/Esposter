import type { AuthSession } from "#server/models/auth/AuthSession";

import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { DEVICE_ID_HEADER } from "#shared/models/realtime/DeviceId";
import { describe, expect, test } from "vitest";

describe(getRoomActor, () => {
  const payload = { session: {}, user: { id: "22222222-2222-7222-8222-222222222222" } } as AuthSession;

  test("names the tab that made the write, so its own socket is not sent the echo", () => {
    expect.hasAssertions();

    const deviceId = "33333333-3333-7333-8333-333333333333";
    expect(getRoomActor({ headers: new Headers({ [DEVICE_ID_HEADER]: deviceId }), user: payload.user })).toStrictEqual({
      deviceId,
      userId: payload.user.id,
    });
  });

  test("names no tab when the header is not a device id, so a forged value cannot pick a socket to exclude", () => {
    expect.hasAssertions();

    expect(
      getRoomActor({ headers: new Headers({ [DEVICE_ID_HEADER]: "device-tag:user:admin" }), user: payload.user }),
    ).toStrictEqual({ userId: payload.user.id });
  });
});
