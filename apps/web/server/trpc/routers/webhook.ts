import type { NamedAppUserInMessage } from "#shared/models/db/webhook/NamedAppUserInMessage";
import type {
  IssuedWebhookInMessage,
  PublicWebhookInMessage,
  WebhookInMessageWithRelations,
} from "@esposter/db-schema";

import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { inRoom } from "#server/services/db/inRoom";
import { publicWebhookColumns } from "#server/services/webhook/publicWebhookColumns";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { createWebhookInputSchema } from "#shared/models/db/webhook/CreateWebhookInput";
import { deleteWebhookInputSchema } from "#shared/models/db/webhook/DeleteWebhookInput";
import { readAppUsersInputSchema } from "#shared/models/db/webhook/ReadAppUsersInput";
import { regenerateTokenInputSchema } from "#shared/models/db/webhook/RegenerateTokenInput";
import { updateWebhookInputSchema } from "#shared/models/db/webhook/UpdateWebhookInput";
import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { inJsonArray } from "@esposter/db";
import {
  appUsersInMessage,
  DatabaseEntityType,
  getLiveRowWhere,
  PublicWebhookColumns,
  roomIdSchema,
  RoomPermission,
  roomsInMessage,
  WebhookInMessageRelations,
  webhooksInMessage,
} from "@esposter/db-schema";
import { generateSecretToken, hashSecretToken, Operation } from "@esposter/shared";
import { and, eq, getColumns, inArray, sql } from "drizzle-orm";
import { v7 } from "uuid";

export const webhookRouter = router({
  createWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    createWebhookInputSchema,
    "roomId",
    RateLimiterType.Slow,
  ).mutation<IssuedWebhookInMessage>(async ({ ctx, input: { name, roomId } }) => {
    const webhookContext = JSON.stringify({ name, roomId });
    // The webhook posts as its app user, so the app user's id is named up front. Both rows are selected from the room
    // Only while it holds fewer webhooks than the cap, so a full room refuses the pair and writes neither of them
    const appUserId = v7();
    const webhookId = v7();
    const creatorId = ctx.user.id;
    // Only the hash is stored. The credential leaves in this response alone, and no later read can return it again
    const token = generateSecretToken();
    const tokenHash = await hashSecretToken(token);
    const isUnderWebhookCap = and(
      eq(roomsInMessage.id, roomId),
      sql`(select count(*) from ${webhooksInMessage} where ${and(eq(webhooksInMessage.roomId, roomId), getLiveRowWhere(webhooksInMessage))}) < ${WEBHOOK_MAX_LENGTH}`,
    );
    const [, webhookRows] = await ctx.db.batch([
      ctx.db.insert(appUsersInMessage).select(
        ctx.db
          .select({ ...getInsertSelectMetadata(appUsersInMessage), id: sql`${appUserId}`.as("id") })
          .from(roomsInMessage)
          .where(isUnderWebhookCap),
      ),
      ctx.db
        .insert(webhooksInMessage)
        .select(
          ctx.db
            .select({
              ...getInsertSelectMetadata(webhooksInMessage),
              creatorId: sql`${creatorId}`.as("creatorId"),
              id: sql`${webhookId}`.as("id"),
              isActive: sql`${sql.param(true, webhooksInMessage.isActive)}`.as("isActive"),
              name: sql`${name}`.as("name"),
              roomId: roomsInMessage.id,
              tokenHash: sql`${tokenHash}`.as("tokenHash"),
              userId: sql`${appUserId}`.as("userId"),
            })
            .from(roomsInMessage)
            .where(isUnderWebhookCap),
        )
        .returning(publicWebhookColumns),
    ]);
    return {
      token,
      webhook: requireMutation(webhookRows[0], Operation.Create, DatabaseEntityType.Webhook, webhookContext),
    };
  }),
  // The webhook and the app user it posts as are tombstoned together. A hard delete of the app user would cascade the webhook
  // Away with no tombstone to answer for it. The app user is named by the live webhook, so its statement runs first, while
  // The webhook is still live, and the webhook's own statement then tombstones the row the answer names
  deleteWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    deleteWebhookInputSchema,
    "roomId",
  ).mutation<PublicWebhookInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const [, deletedWebhooks] = await ctx.db.batch([
      ctx.db
        .update(appUsersInMessage)
        .set({ deletedAt: new Date() })
        .where(
          inArray(
            appUsersInMessage.id,
            ctx.db
              .select({ userId: webhooksInMessage.userId })
              .from(webhooksInMessage)
              .where(and(inRoom(webhooksInMessage, id, roomId), getLiveRowWhere(webhooksInMessage))),
          ),
        ),
      ctx.db
        .update(webhooksInMessage)
        .set({ deletedAt: new Date() })
        .where(and(inRoom(webhooksInMessage, id, roomId), getLiveRowWhere(webhooksInMessage)))
        .returning(publicWebhookColumns),
    ]);
    return requireMutation(deletedWebhooks[0], Operation.Delete, DatabaseEntityType.Webhook, id);
  }),
  readAppUsers: getMemberProcedure(readAppUsersInputSchema, "roomId").query<NamedAppUserInMessage[]>(
    ({ ctx, input: { ids, roomId } }) =>
      // The name is the webhook's, the row that renames the bot, so a rename reaches every message the bot posted
      ctx.db
        .select({ ...getColumns(appUsersInMessage), name: webhooksInMessage.name })
        .from(appUsersInMessage)
        .innerJoin(webhooksInMessage, eq(webhooksInMessage.userId, appUsersInMessage.id))
        .where(
          and(
            eq(webhooksInMessage.roomId, roomId),
            getLiveRowWhere(webhooksInMessage),
            inJsonArray(appUsersInMessage.id, ids),
          ),
        ),
  ),
  readWebhooks: getPermissionsProcedure(RoomPermission.ManageWebhooks, roomIdSchema, "roomId").query<
    WebhookInMessageWithRelations[]
  >(({ ctx, input: { roomId } }) =>
    ctx.db.query.webhooksInMessage.findMany({
      columns: PublicWebhookColumns,
      orderBy: { id: "desc" },
      where: { roomId: { eq: roomId } },
      with: WebhookInMessageRelations,
    }),
  ),
  regenerateToken: getPermissionsProcedure(RoomPermission.ManageWebhooks, regenerateTokenInputSchema, "roomId")
    .meta({ staticReason: "The credential is never read back, so no reader's copy of a webhook changes" })
    .mutation<IssuedWebhookInMessage>(async ({ ctx, input: { id, roomId } }) => {
      // The old credential stops matching the moment this write lands, so the URL it named stops delivering
      const token = generateSecretToken();
      const tokenHash = await hashSecretToken(token);
      const webhook = requireMutation(
        (
          await ctx.db
            .update(webhooksInMessage)
            .set({ tokenHash })
            .where(and(inRoom(webhooksInMessage, id, roomId), getLiveRowWhere(webhooksInMessage)))
            .returning(publicWebhookColumns)
        )[0],
        Operation.Update,
        DatabaseEntityType.Webhook,
        id,
      );
      return { token, webhook };
    }),
  updateWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    updateWebhookInputSchema,
    "roomId",
  ).mutation<PublicWebhookInMessage>(async ({ ctx, input: { id, roomId, ...rest } }) =>
    requireMutation(
      (
        await ctx.db
          .update(webhooksInMessage)
          .set(rest)
          .where(and(inRoom(webhooksInMessage, id, roomId), getLiveRowWhere(webhooksInMessage)))
          .returning(publicWebhookColumns)
      )[0],
      Operation.Update,
      DatabaseEntityType.Webhook,
      id,
    ),
  ),
});
