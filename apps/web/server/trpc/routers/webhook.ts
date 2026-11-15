import type { NamedAppUserInMessage } from "#shared/models/db/webhook/NamedAppUserInMessage";
import type {
  IssuedWebhookInMessage,
  PublicWebhookInMessage,
  WebhookInMessageWithRelations,
} from "@esposter/db-schema";

import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { inRoom } from "#server/services/db/inRoom";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
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
  getTopic,
  roomIdSchema,
  RoomPermission,
  roomsInMessage,
  TopicKind,
  WebhookInMessageRelations,
  webhooksInMessage,
} from "@esposter/db-schema";
import { generateSecretToken, hashSecretToken, Operation } from "@esposter/shared";
import { and, eq, getColumns, sql } from "drizzle-orm";
import { v7 } from "uuid";

// Every column of a webhook a response carries: all of them but the hash of its credential
const { tokenHash: _tokenHash, ...publicWebhookColumns } = getColumns(webhooksInMessage);

export const webhookRouter = router({
  createWebhook: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageWebhooks, createWebhookInputSchema, "roomId", RateLimiterType.Slow),
    ({ input }) => [getTopic(TopicKind.Webhook, input.roomId)],
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
      sql`(select count(*) from ${webhooksInMessage} where ${eq(webhooksInMessage.roomId, roomId)}) < ${WEBHOOK_MAX_LENGTH}`,
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
  deleteWebhook: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageWebhooks, deleteWebhookInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Webhook, input.roomId)],
  ).mutation<PublicWebhookInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const webhook = await requireEntity(
      ctx.db.query.webhooksInMessage.findFirst({
        columns: { tokenHash: false },
        where: { id: { eq: id }, roomId: { eq: roomId } },
      }),
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
  readAppUsers: getTopicsProcedure(getMemberProcedure(readAppUsersInputSchema, "roomId"), ({ input }) => [
    getTopic(TopicKind.Webhook, input.roomId),
  ]).query<NamedAppUserInMessage[]>(({ ctx, input: { ids, roomId } }) =>
    // The name is the webhook's, the row that renames the bot, so a rename reaches every message the bot posted
    ctx.db
      .select({ ...getColumns(appUsersInMessage), name: webhooksInMessage.name })
      .from(appUsersInMessage)
      .innerJoin(webhooksInMessage, eq(webhooksInMessage.userId, appUsersInMessage.id))
      .where(and(eq(webhooksInMessage.roomId, roomId), inJsonArray(appUsersInMessage.id, ids))),
  ),
  readWebhooks: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageWebhooks, roomIdSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Webhook, input.roomId)],
  ).query<WebhookInMessageWithRelations[]>(({ ctx, input: { roomId } }) =>
    ctx.db.query.webhooksInMessage.findMany({
      columns: { tokenHash: false },
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
            .where(inRoom(webhooksInMessage, id, roomId))
            .returning(publicWebhookColumns)
        )[0],
        Operation.Update,
        DatabaseEntityType.Webhook,
        id,
      );
      return { token, webhook };
    }),
  updateWebhook: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageWebhooks, updateWebhookInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Webhook, input.roomId)],
  ).mutation<PublicWebhookInMessage>(async ({ ctx, input: { id, roomId, ...rest } }) =>
    requireMutation(
      (
        await ctx.db
          .update(webhooksInMessage)
          .set(rest)
          .where(inRoom(webhooksInMessage, id, roomId))
          .returning(publicWebhookColumns)
      )[0],
      Operation.Update,
      DatabaseEntityType.Webhook,
      id,
    ),
  ),
});
