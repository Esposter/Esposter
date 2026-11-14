import type { AppUserInMessage, WebhookInMessage, WebhookInMessageWithRelations } from "@esposter/db-schema";

import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { generateToken } from "#server/services/auth/generateToken";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { inRoom } from "#server/services/db/inRoom";
import { router } from "#server/trpc";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { createWebhookInputSchema } from "#shared/models/db/webhook/CreateWebhookInput";
import { deleteWebhookInputSchema } from "#shared/models/db/webhook/DeleteWebhookInput";
import { readAppUsersInputSchema } from "#shared/models/db/webhook/ReadAppUsersInput";
import { rotateTokenInputSchema } from "#shared/models/db/webhook/RotateTokenInput";
import { updateWebhookInputSchema } from "#shared/models/db/webhook/UpdateWebhookInput";
import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import {
  appUsersInMessage,
  DatabaseEntityType,
  roomIdSchema,
  RoomPermission,
  roomsInMessage,
  WebhookInMessageRelations,
  webhooksInMessage,
} from "@esposter/db-schema";
import { inJsonArray } from "@esposter/db";
import { Operation } from "@esposter/shared";
import { and, eq, getColumns, sql } from "drizzle-orm";

export const webhookRouter = router({
  createWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    createWebhookInputSchema,
    "roomId",
    RateLimiterType.Slow,
  ).mutation<WebhookInMessage>(async ({ ctx, input: { name, roomId } }) => {
    const webhookContext = JSON.stringify({ name, roomId });
    // The webhook posts as its app user, so the app user's id is named up front. Both rows are selected from the room
    // Only while it holds fewer webhooks than the cap, so a full room refuses the pair and writes neither of them
    const appUserId = crypto.randomUUID();
    const webhookId = crypto.randomUUID();
    const creatorId = ctx.getSessionPayload.user.id;
    const token = generateToken();
    const isUnderWebhookCap = and(
      eq(roomsInMessage.id, roomId),
      sql`(select count(*) from ${webhooksInMessage} where ${eq(webhooksInMessage.roomId, roomId)}) < ${WEBHOOK_MAX_LENGTH}`,
    );
    const [, webhookRows] = await ctx.db.batch([
      ctx.db.insert(appUsersInMessage).select(
        ctx.db
          .select({ ...getInsertSelectMetadata(appUsersInMessage), id: sql`${appUserId}`, name: sql`${name}` })
          .from(roomsInMessage)
          .where(isUnderWebhookCap),
      ),
      ctx.db
        .insert(webhooksInMessage)
        .select(
          ctx.db
            .select({
              ...getInsertSelectMetadata(webhooksInMessage),
              creatorId: sql`${creatorId}`,
              id: sql`${webhookId}`,
              isActive: sql`${sql.param(true, webhooksInMessage.isActive)}`,
              name: sql`${name}`,
              roomId: roomsInMessage.id,
              token: sql`${token}`,
              userId: sql`${appUserId}`,
            })
            .from(roomsInMessage)
            .where(isUnderWebhookCap),
        )
        .returning(),
    ]);
    return requireMutation(webhookRows[0], Operation.Create, DatabaseEntityType.Webhook, webhookContext);
  }),
  deleteWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    deleteWebhookInputSchema,
    "roomId",
  ).mutation<WebhookInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const webhook = await requireEntity(
      ctx.db.query.webhooksInMessage.findFirst({ where: { id: { eq: id }, roomId: { eq: roomId } } }),
      DatabaseEntityType.Webhook,
      id,
    );
    // The webhook row is cascade-deleted with the app user it posts as, so the app user is the one delete
    requireMutation(
      (await ctx.db.delete(appUsersInMessage).where(eq(appUsersInMessage.id, webhook.userId)).returning())[0],
      Operation.Delete,
      DatabaseEntityType.AppUser,
      webhook.userId,
    );
    return webhook;
  }),
  readAppUsers: getMemberProcedure(readAppUsersInputSchema, "roomId").query<AppUserInMessage[]>(
    ({ ctx, input: { ids, roomId } }) =>
      ctx.db
        .select(getColumns(appUsersInMessage))
        .from(appUsersInMessage)
        .innerJoin(webhooksInMessage, eq(webhooksInMessage.userId, appUsersInMessage.id))
        .where(and(eq(webhooksInMessage.roomId, roomId), inJsonArray(appUsersInMessage.id, ids))),
  ),
  readWebhooks: getPermissionsProcedure(RoomPermission.ManageWebhooks, roomIdSchema, "roomId").query<
    WebhookInMessageWithRelations[]
  >(({ ctx, input: { roomId } }) =>
    ctx.db.query.webhooksInMessage.findMany({
      orderBy: { createdAt: "desc" },
      where: { roomId: { eq: roomId } },
      with: WebhookInMessageRelations,
    }),
  ),
  rotateToken: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    rotateTokenInputSchema,
    "roomId",
  ).mutation<WebhookInMessage>(async ({ ctx, input: { id, roomId } }) =>
    requireMutation(
      (
        await ctx.db
          .update(webhooksInMessage)
          .set({ token: generateToken() })
          .where(inRoom(webhooksInMessage, id, roomId))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.Webhook,
      id,
    ),
  ),
  updateWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    updateWebhookInputSchema,
    "roomId",
  ).mutation<WebhookInMessage>(async ({ ctx, input: { id, roomId, ...rest } }) =>
    requireMutation(
      (
        await ctx.db
          .update(webhooksInMessage)
          .set(rest)
          .where(inRoom(webhooksInMessage, id, roomId))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.Webhook,
      id,
    ),
  ),
});
