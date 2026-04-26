import type { WebhookInMessage } from "@esposter/db-schema";

import { createWebhookInputSchema } from "#shared/models/db/webhook/CreateWebhookInput";
import { deleteWebhookInputSchema } from "#shared/models/db/webhook/DeleteWebhookInput";
import { rotateTokenInputSchema } from "#shared/models/db/webhook/RotateTokenInput";
import { updateWebhookInputSchema } from "#shared/models/db/webhook/UpdateWebhookInput";
import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { generateToken } from "@@/server/services/auth/generateToken";
import { router } from "@@/server/trpc";
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
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, eq, getTableColumns, inArray } from "drizzle-orm";
import { z } from "zod";

const readWebhooksInputSchema = roomIdSchema;
export type ReadWebhooksInput = z.infer<typeof readWebhooksInputSchema>;

const readAppUsersByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  ids: selectAppUserInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type ReadAppUsersByIdsInput = z.infer<typeof readAppUsersByIdsInputSchema>;

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
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Create,
            DatabaseEntityType.Webhook,
            JSON.stringify({ name, roomId }),
          ).message,
        });

      const newAppUser = (await tx.insert(appUsersInMessage).values({ name }).returning())[0];
      if (!newAppUser)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.AppUser, JSON.stringify({ name }))
            .message,
        });

      const token = generateToken();
      const newWebhook = (
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
      )[0];
      if (!newWebhook)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Create,
            DatabaseEntityType.Webhook,
            JSON.stringify({ name, roomId }),
          ).message,
        });
      return newWebhook;
    }),
  ),
  deleteWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    deleteWebhookInputSchema,
    "roomId",
  ).mutation<WebhookInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const webhook = await ctx.db.query.webhooksInMessage.findFirst({
      where: { id: { eq: id }, roomId: { eq: roomId } },
    });
    if (!webhook)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.Webhook, id).message,
      });

    const deletedAppUser = (
      await ctx.db.delete(appUsersInMessage).where(eq(appUsersInMessage.id, webhook.userId)).returning()
    ).find(Boolean);
    if (!deletedAppUser)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.AppUser, webhook.userId).message,
      });
    return webhook;
  }),
  readAppUsersByIds: getMemberProcedure(readAppUsersByIdsInputSchema, "roomId").query(
    ({ ctx, input: { ids, roomId } }) =>
      ctx.db
        .select(getTableColumns(appUsersInMessage))
        .from(appUsersInMessage)
        .innerJoin(webhooksInMessage, eq(webhooksInMessage.userId, appUsersInMessage.id))
        .where(and(eq(webhooksInMessage.roomId, roomId), inArray(appUsersInMessage.id, ids))),
  ),
  readWebhooks: getPermissionsProcedure(RoomPermission.ManageWebhooks, readWebhooksInputSchema, "roomId").query(
    ({ ctx, input: { roomId } }) =>
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
  ).mutation<WebhookInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const token = generateToken();
    const updatedWebhook = (
      await ctx.db
        .update(webhooksInMessage)
        .set({ token })
        .where(and(eq(webhooksInMessage.id, id), eq(webhooksInMessage.roomId, roomId)))
        .returning()
    )[0];
    if (!updatedWebhook)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Webhook, id).message,
      });
    return updatedWebhook;
  }),
  updateWebhook: getPermissionsProcedure(
    RoomPermission.ManageWebhooks,
    updateWebhookInputSchema,
    "roomId",
  ).mutation<WebhookInMessage>(async ({ ctx, input: { id, roomId, ...rest } }) => {
    const updatedWebhook = (
      await ctx.db
        .update(webhooksInMessage)
        .set(rest)
        .where(and(eq(webhooksInMessage.id, id), eq(webhooksInMessage.roomId, roomId)))
        .returning()
    )[0];
    if (!updatedWebhook)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Webhook, id).message,
      });
    return updatedWebhook;
  }),
});
