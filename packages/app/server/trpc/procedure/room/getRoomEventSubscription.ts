import type { Device } from "#shared/models/auth/Device";
import type { EventEmitter } from "node:events";

import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { roomIdSchema } from "@esposter/db-schema";
// The shared single-room subscription shape: forward `[data, device]` events matching the
// Input room to everyone in it except the emitting device.
export const getRoomEventSubscription = <
  TKey extends keyof TEventMap & string,
  TEventMap extends Record<TKey, [[unknown, Device]]>,
>(
  eventEmitter: EventEmitter<TEventMap>,
  eventName: TKey,
  getRoomId: (data: TEventMap[TKey][0][0]) => string,
) =>
  getMemberProcedure(roomIdSchema, "roomId").subscription(async function* ({
    ctx,
    input: { roomId },
    signal,
  }): AsyncGenerator<TEventMap[TKey][0][0]> {
    for await (const [[data, device]] of on(eventEmitter, eventName, { signal })) {
      const typedData = data as TEventMap[TKey][0][0];
      if (getRoomId(typedData) === roomId && !getIsSameDevice(device, ctx.getSessionPayload)) yield typedData;
    }
  });
