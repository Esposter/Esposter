import type { Webhook } from "@esposter/db-schema";

import { createWebhookInputSchema } from "#shared/models/db/webhook/CreateWebhookInput";
import { deleteWebhookInputSchema } from "#shared/models/db/webhook/DeleteWebhookInput";
import { rotateTokenInputSchema } from "#shared/models/db/webhook/RotateTokenInput";
import { updateWebhookInputSchema } from "#shared/models/db/webhook/UpdateWebhookInput";
import { generateToken } from "@@/server/services/auth/generateToken";
import { router } from "@@/server/trpc";
import { getCreatorProcedure } from "@@/server/trpc/procedure/room/getCreatorProcedure";
import { appUsers, DatabaseEntityType, selectRoomSchema, WebhookRelations, webhooks } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readWebhooksInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type ReadWebhooksInput = z.infer<typeof readWebhooksInputSchema>;

export const webhookRouter = router({
  createWebhook: getCreatorProcedure(createWebhookInputSchema, "roomId").mutation<Webhook>(
    async ({ ctx, input: { name, roomId } }) => {
      const newAppUser = (await ctx.db.insert(appUsers).values({ name }).returning()).find(Boolean);
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
      ).find(Boolean);
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
      const deletedWebhook = (
        await ctx.db
          .delete(webhooks)
          .where(and(eq(webhooks.id, id), eq(webhooks.roomId, roomId)))
          .returning()
      ).find(Boolean);
      if (!deletedWebhook)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Webhook, id).message,
        });
      return deletedWebhook;
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
      ).find(Boolean);
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
      ).find(Boolean);
      if (!updatedWebhook)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Webhook, id).message,
        });
      return updatedWebhook;
    },
  ),
});
