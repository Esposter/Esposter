import type { Device } from "#shared/models/auth/Device";
import type { EventEmitter } from "node:events";

import { checkIsSameDevice } from "#server/services/auth/checkIsSameDevice";
import { onWhileMember } from "#server/services/room/onWhileMember";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { roomIdSchema } from "@esposter/db-schema";

// Forwards `[data, device?]` events matching the input room to everyone in it. The device is the client that
// Caused the event, and its own subscription skips it; an event carrying none was caused by no single client,
// So there is nobody to skip and it reaches the whole room. The stream ends when the subscriber leaves the room
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
    const events = onWhileMember(eventEmitter, eventName, { roomId, signal, userId: ctx.getSessionPayload.user.id });
    for await (const [[data, device]] of events) {
      const typedData = data as TEventMap[TKey][0][0];
      if (getRoomId(typedData) === roomId && (!device || !checkIsSameDevice(device, ctx.getSessionPayload)))
        yield typedData;
    }
  });
