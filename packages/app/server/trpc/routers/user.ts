import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { ReadableStream } from "node:stream/web";
import type { SetNonNullable } from "type-fest";
import type { z } from "zod/v4";

import { selectUserSchema } from "#shared/db/schema/users";
import { selectUserStatusSchema, userStatuses } from "#shared/db/schema/userStatuses";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { UserStatus } from "#shared/models/db/user/UserStatus";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { userEventEmitter } from "@@/server/services/esbabbler/events/userEventEmitter";
import { getDetectedUserStatus } from "@@/server/services/esbabbler/getDetectedUserStatus";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { octetInputParser } from "@trpc/server/http";
import { inArray } from "drizzle-orm";
import { Readable } from "node:stream";

const readStatusesInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type ReadStatusesInput = z.infer<typeof readStatusesInputSchema>;

const upsertStatusInputSchema = selectUserStatusSchema
  .pick({ message: true, status: true })
  .partial()
  .refine(({ message, status }) => message !== undefined || status !== undefined);
export type UpsertStatusInput = z.infer<typeof upsertStatusInputSchema>;

const onUpsertStatusInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnUpsertStatusInput = z.infer<typeof onUpsertStatusInputSchema>;

export const userRouter = router({
  connect: authedProcedure.mutation(async ({ ctx }) => {
    const upsertedStatus = (
      await ctx.db
        .insert(userStatuses)
        .values({ isConnected: true, userId: ctx.session.user.id })
        .onConflictDoUpdate({
          set: { isConnected: true },
          target: userStatuses.userId,
        })
        .returning()
    ).find(Boolean);
    if (!upsertedStatus)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.UserStatus, userRouter.disconnect.name)
          .message,
      });

    userEventEmitter.emit("upsertStatus", { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) });
  }),
  disconnect: authedProcedure.mutation(async ({ ctx }) => {
    const upsertedStatus = (
      await ctx.db
        .insert(userStatuses)
        .values({ isConnected: false, userId: ctx.session.user.id })
        .onConflictDoUpdate({
          set: { isConnected: false },
          target: userStatuses.userId,
        })
        .returning()
    ).find(Boolean);
    if (!upsertedStatus)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.UserStatus, userRouter.disconnect.name)
          .message,
      });

    userEventEmitter.emit("upsertStatus", { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) });
  }),
  onUpsertStatus: authedProcedure.input(onUpsertStatusInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    if (input.includes(ctx.session.user.id)) throw new TRPCError({ code: "BAD_REQUEST" });

    for await (const [data] of on(userEventEmitter, "upsertStatus", { signal })) {
      if (!input.includes(data.userId)) continue;
      yield data;
    }
  }),
  readStatuses: authedProcedure.input(readStatusesInputSchema).query(async ({ ctx, input }) => {
    const foundUserStatuses = await ctx.db.select().from(userStatuses).where(inArray(userStatuses.userId, input));
    const resultUserStatuses: SetNonNullable<IUserStatus, "status">[] = [];

    for (const userId of input) {
      const foundStatus = foundUserStatuses.find((us) => us.userId === userId);
      if (!foundStatus)
        // We'll conveniently assume that if they don't have a user status record yet
        // it means that they're still online as we insert a record as soon as they go offline
        resultUserStatuses.push({
          createdAt: new Date(),
          deletedAt: null,
          expiresAt: null,
          isConnected: true,
          message: "",
          status: UserStatus.Online,
          updatedAt: new Date(),
          userId,
        });
      else resultUserStatuses.push({ ...foundStatus, status: getDetectedUserStatus(foundStatus) });
    }

    return resultUserStatuses;
  }),
  uploadProfileImage: authedProcedure.input(octetInputParser).mutation(async ({ ctx, input }) => {
    const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
    const blobName = `${ctx.session.user.id}/ProfileImage`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // @TODO: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542
    const readable = Readable.fromWeb(input as ReadableStream);
    await blockBlobClient.uploadStream(readable);
    return blockBlobClient.url;
  }),
  upsertStatus: authedProcedure.input(upsertStatusInputSchema).mutation(async ({ ctx, input }) => {
    const upsertedStatus = (
      await ctx.db
        .insert(userStatuses)
        .values({ ...input, userId: ctx.session.user.id })
        .onConflictDoUpdate({
          set: { ...input },
          target: userStatuses.userId,
        })
        .returning()
    ).find(Boolean);
    if (!upsertedStatus)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.UserStatus, JSON.stringify(input))
          .message,
      });

    userEventEmitter.emit("upsertStatus", { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) });
  }),
});
