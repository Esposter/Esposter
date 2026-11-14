import type {
  AppUserInMessage,
  IssuedWebhookInMessage,
  PublicWebhookInMessage,
  WebhookInMessageWithRelations,
} from "@esposter/db-schema";

import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
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
import { regenerateTokenInputSchema } from "#shared/models/db/webhook/RegenerateTokenInput";
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
import { generateSecretToken, hashSecretToken, Operation } from "@esposter/shared";
import { and, eq, getColumns, sql } from "drizzle-orm";
import { v7 } from "uuid";

// Every column of a webhook a response carries: all of them but the hash of its credential
const { tokenHash: _tokenHash, ...publicWebhookColumns } = getColumns(webhooksInMessage);

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
    const creatorId = ctx.getSessionPayload.user.id;
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
              tokenHash: sql`${tokenHash}`,
              userId: sql`${appUserId}`,
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
  deleteWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    deleteWebhookInputSchema,
    "roomId",
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
      columns: { tokenHash: false },
      orderBy: { id: "desc" },
      where: { roomId: { eq: roomId } },
      with: WebhookInMessageRelations,
    }),
  ),
  regenerateToken: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    regenerateTokenInputSchema,
    "roomId",
  ).mutation<IssuedWebhookInMessage>(async ({ ctx, input: { id, roomId } }) => {
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
          .where(inRoom(webhooksInMessage, id, roomId))
          .returning(publicWebhookColumns)
      )[0],
      Operation.Update,
      DatabaseEntityType.Webhook,
      id,
    ),
  ),
});
