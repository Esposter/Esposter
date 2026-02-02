import type { Webhook } from "@esposter/db-schema";

import { createWebhookInputSchema } from "#shared/models/db/webhook/CreateWebhookInput";
import { deleteWebhookInputSchema } from "#shared/models/db/webhook/DeleteWebhookInput";
import { rotateTokenInputSchema } from "#shared/models/db/webhook/RotateTokenInput";
import { updateWebhookInputSchema } from "#shared/models/db/webhook/UpdateWebhookInput";
import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { generateToken } from "@@/server/services/auth/generateToken";
import { router } from "@@/server/trpc";
import { getCreatorProcedure } from "@@/server/trpc/procedure/room/getCreatorProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import {
  appUsers,
  DatabaseEntityType,
  selectAppUserSchema,
  selectRoomSchema,
  WebhookRelations,
  webhooks,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray } from "drizzle-orm";
import { z } from "zod";

const readWebhooksInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type ReadWebhooksInput = z.infer<typeof readWebhooksInputSchema>;

const readAppUsersByIdsInputSchema = z.object({
  ids: selectAppUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type ReadAppUsersByIdsInput = z.infer<typeof readAppUsersByIdsInputSchema>;

export const webhookRouter = router({
  createWebhook: getCreatorProcedure(createWebhookInputSchema, "roomId", RateLimiterType.Slow).mutation<Webhook>(
    async ({ ctx, input: { name, roomId } }) => {
      const webhookCount = takeOne(
        await ctx.db.select({ count: count() }).from(webhooks).where(eq(webhooks.roomId, roomId)),
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

      const newAppUser = (await ctx.db.insert(appUsers).values({ name }).returning())[0];
      if (!newAppUser)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.AppUser, JSON.stringify({ name }))
            .message,
        });

      const token = generateToken();
      const newWebhook = (
        await ctx.db
          .insert(webhooks)
          .values({ creatorId: ctx.session.user.id, isActive: true, name, roomId, token, userId: newAppUser.id })
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
    },
  ),
  deleteWebhook: getCreatorProcedure(deleteWebhookInputSchema, "roomId").mutation<Webhook>(
    async ({ ctx, input: { id, roomId } }) => {
      const webhook = await ctx.db.query.webhooks.findFirst({
        where: (webhooks, { eq }) => and(eq(webhooks.id, id), eq(webhooks.roomId, roomId)),
      });
      if (!webhook)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Webhook, id).message,
        });

      const deletedAppUser = (await ctx.db.delete(appUsers).where(eq(appUsers.id, webhook.userId)).returning()).find(
        Boolean,
      );
      if (!deletedAppUser)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.AppUser, webhook.userId).message,
        });
      return webhook;
    },
  ),
  readAppUsersByIds: getMemberProcedure(readAppUsersByIdsInputSchema, "roomId").query(
    async ({ ctx, input: { ids, roomId } }) => {
      const readAppUsers = await ctx.db
        .select({ appUser: appUsers })
        .from(appUsers)
        .innerJoin(webhooks, eq(webhooks.userId, appUsers.id))
        .where(and(eq(webhooks.roomId, roomId), inArray(appUsers.id, ids)));
      return readAppUsers.map(({ appUser }) => appUser);
    },
  ),
  readWebhooks: getCreatorProcedure(readWebhooksInputSchema, "roomId").query(({ ctx, input: { roomId } }) =>
    ctx.db.query.webhooks.findMany({
      orderBy: (webhooks, { desc }) => [desc(webhooks.createdAt)],
      where: (webhooks, { eq }) => eq(webhooks.roomId, roomId),
      with: WebhookRelations,
    }),
  ),
  rotateToken: getCreatorProcedure(rotateTokenInputSchema, "roomId").mutation<Webhook>(
    async ({ ctx, input: { id, roomId } }) => {
      const token = generateToken();
      const updatedWebhook = (
        await ctx.db
          .update(webhooks)
          .set({ token })
          .where(and(eq(webhooks.id, id), eq(webhooks.roomId, roomId)))
          .returning()
      )[0];
      if (!updatedWebhook)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Webhook, id).message,
        });
      return updatedWebhook;
    },
  ),
  updateWebhook: getCreatorProcedure(updateWebhookInputSchema, "roomId").mutation<Webhook>(
    async ({ ctx, input: { id, roomId, ...rest } }) => {
      const updatedWebhook = (
        await ctx.db
          .update(webhooks)
          .set(rest)
          .where(and(eq(webhooks.id, id), eq(webhooks.roomId, roomId)))
          .returning()
      )[0];
      if (!updatedWebhook)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Webhook, id).message,
        });
      return updatedWebhook;
    },
  ),
});
