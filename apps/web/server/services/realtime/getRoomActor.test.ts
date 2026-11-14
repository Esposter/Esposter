import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { DEVICE_ID_HEADER } from "#shared/models/realtime/DeviceId";
import { describe, expect, test } from "vitest";

import { getRoomActor } from "#server/services/realtime/getRoomActor";

describe(getRoomActor, () => {
  const payload = { session: {}, user: { id: "22222222-2222-4222-8222-222222222222" } } as GetSessionPayload;

  test("names the tab that made the write, so its own socket is not sent the echo", () => {
    expect.hasAssertions();

    const deviceId = "33333333-3333-4333-8333-333333333333";
    expect(getRoomActor(payload, new Headers({ [DEVICE_ID_HEADER]: deviceId }))).toStrictEqual({
      deviceId,
      userId: payload.user.id,
    });
  });

  test("names no tab when the header is not a device id, so a forged value cannot pick a socket to exclude", () => {
    expect.hasAssertions();

    expect(getRoomActor(payload, new Headers({ [DEVICE_ID_HEADER]: "device-tag:user:admin" }))).toStrictEqual({
      userId: payload.user.id,
    });
  });
});
