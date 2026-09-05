import type { AppUserInMessage, WebhookInMessage, WebhookInMessageWithRelations } from "@esposter/db-schema";

import { createWebhookInputSchema } from "#shared/models/db/webhook/CreateWebhookInput";
import { deleteWebhookInputSchema } from "#shared/models/db/webhook/DeleteWebhookInput";
import { rotateTokenInputSchema } from "#shared/models/db/webhook/RotateTokenInput";
import { updateWebhookInputSchema } from "#shared/models/db/webhook/UpdateWebhookInput";
import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { generateToken } from "@@/server/services/auth/generateToken";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import {
  appUsersInMessage,
  DatabaseEntityType,
  roomIdSchema,
  RoomPermission,
  selectAppUserInMessageSchema,
  WebhookInMessageRelations,
  webhooksInMessage,
} from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT, Operation, takeOne } from "@esposter/shared";
import { and, count, eq, getColumns, inArray } from "drizzle-orm";
import { z } from "zod";

const readWebhooksInputSchema = roomIdSchema;

const readAppUsersInputSchema = z.object({
  ...roomIdSchema.shape,
  ids: createUniqueArraySchema(selectAppUserInMessageSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
// A webhook is addressed by both keys so the room the permission was checked against is the room the row must
// Belong to — an id alone would let a moderator of one room rewrite another's
const getWebhookRoomWhere = (id: string, roomId: string) =>
  and(eq(webhooksInMessage.id, id), eq(webhooksInMessage.roomId, roomId));

export const webhookRouter = router({
  createWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    createWebhookInputSchema,
    "roomId",
    RateLimiterType.Slow,
  ).mutation<WebhookInMessage>(({ ctx, input: { name, roomId } }) =>
    ctx.db.transaction(async (tx) => {
      const webhookCount = takeOne(
        await tx.select({ count: count() }).from(webhooksInMessage).where(eq(webhooksInMessage.roomId, roomId)),
      ).count;
      if (webhookCount >= WEBHOOK_MAX_LENGTH)
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Webhook, JSON.stringify({ name, roomId }));

      const newAppUser = requireMutation(
        (await tx.insert(appUsersInMessage).values({ name }).returning())[0],
        Operation.Create,
        DatabaseEntityType.AppUser,
        JSON.stringify({ name }),
      );
      const token = generateToken();
      return requireMutation(
        (
          await tx
            .insert(webhooksInMessage)
            .values({
              creatorId: ctx.getSessionPayload.user.id,
              isActive: true,
              name,
              roomId,
              token,
              userId: newAppUser.id,
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.Webhook,
        JSON.stringify({ name, roomId }),
      );
    }),
  ),
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
        .where(and(eq(webhooksInMessage.roomId, roomId), inArray(appUsersInMessage.id, ids))),
  ),
  readWebhooks: getPermissionsProcedure(RoomPermission.ManageWebhooks, readWebhooksInputSchema, "roomId").query<
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
          .where(getWebhookRoomWhere(id, roomId))
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
      (await ctx.db.update(webhooksInMessage).set(rest).where(getWebhookRoomWhere(id, roomId)).returning())[0],
      Operation.Update,
      DatabaseEntityType.Webhook,
      id,
    ),
  ),
});
