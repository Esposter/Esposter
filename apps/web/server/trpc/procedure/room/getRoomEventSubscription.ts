import type { Device } from "#shared/models/auth/Device";
import type { EventEmitter } from "node:events";

import { checkIsSameDevice } from "@@/server/services/auth/checkIsSameDevice";
import { on } from "@@/server/services/events/on";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { roomIdSchema } from "@esposter/db-schema";
// Forwards `[data, device?]` events matching the input room to everyone in it. The device is the client that
// Caused the event, and its own subscription skips it; an event carrying none was caused by no single client,
// So there is nobody to skip and it reaches the whole room.
export const getRoomEventSubscription = <
  TKey extends keyof TEventMap & string,
  TEventMap extends Record<TKey, [[unknown, Device?]]>,
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
      if (getRoomId(typedData) === roomId && (!device || !checkIsSameDevice(device, ctx.getSessionPayload)))
        yield typedData;
    }
  });
