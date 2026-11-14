import { db } from "#server/db";
import { messageEventEmitter } from "#server/services/message/events/messageEventEmitter";
import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { publishEventSchema, PublishEventType } from "@esposter/db-schema";
import { createError, defineEventHandler } from "nuxt/server";

// The functions Worker reaches the server object through this route, and the object re-emits each change on the
// Emitter its subscriptions already listen to. Only the object answers it: the plain Worker runs the same Nitro app,
// But its request carries an execution context, which has no storage, so the route refuses there
export default defineEventHandler(async (event) => {
  const context = event.req.runtime?.cloudflare?.context;
  if (!context || !("storage" in context)) throw createError({ statusCode: 404 });

  const publishEvent = publishEventSchema.parse(await event.req.json());
  if (publishEvent.type === PublishEventType.Message) messageEventEmitter.emit("createMessage", [[publishEvent.message]]);
  else await emitStorageUsage(db, publishEvent.userId);
});
