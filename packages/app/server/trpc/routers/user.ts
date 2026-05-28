import type { UserStatusInMessage } from "@esposter/db-schema";
import type { SetNonNullable } from "type-fest";

import { updateUserInputSchema } from "#shared/models/db/user/UpdateUserInput";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { dayjs } from "#shared/services/dayjs";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { on } from "@@/server/services/events/on";
import { userEventEmitter } from "@@/server/services/message/events/userEventEmitter";
import { getDetectedUserStatus } from "@@/server/services/message/getDetectedUserStatus";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  AzureContainer,
  DatabaseEntityType,
  selectUserSchema,
  selectUserStatusInMessageSchema,
  users,
  UserStatus,
  userStatusesInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";

const readStatusesInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);

const upsertStatusInputSchema = refineAtLeastOne(
  selectUserStatusInMessageSchema.pick({ message: true, status: true }).partial(),
  ["message", "status"],
);

const onUpsertStatusInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);

export const userRouter = router({
  connect: standardAuthedProcedure.mutation(async ({ ctx }) => {
    const upsertedStatus = requireMutation(
      (
        await ctx.db
          .insert(userStatusesInMessage)
          .values({ isConnected: true, userId: ctx.getSessionPayload.user.id })
          .onConflictDoUpdate({
            set: { isConnected: true },
            target: userStatusesInMessage.userId,
          })
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.UserStatus,
      userRouter.connect.name,
    );

    userEventEmitter.emit("upsertStatus", { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) });
  }),
  disconnect: standardAuthedProcedure.mutation(async ({ ctx }) => {
    const upsertedStatus = requireMutation(
      (
        await ctx.db
          .insert(userStatusesInMessage)
          .values({ isConnected: false, userId: ctx.getSessionPayload.user.id })
          .onConflictDoUpdate({
            set: { isConnected: false },
            target: userStatusesInMessage.userId,
          })
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.UserStatus,
      userRouter.disconnect.name,
    );

    userEventEmitter.emit("upsertStatus", { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) });
  }),
  onUpsertStatus: standardAuthedProcedure.input(onUpsertStatusInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    if (input.includes(ctx.getSessionPayload.user.id))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(
          Operation.Create,
          DatabaseEntityType.UserStatus,
          userRouter.onUpsertStatus.name,
        ).message,
      });

    for await (const [data] of on(userEventEmitter, "upsertStatus", { signal })) {
      if (!input.includes(data.userId)) continue;
      yield data;
    }
  }),
  readStatuses: standardAuthedProcedure.input(readStatusesInputSchema).query(async ({ ctx, input }) => {
    const foundUserStatuses = await ctx.db
      .select()
      .from(userStatusesInMessage)
      .where(inArray(userStatusesInMessage.userId, input));
    const resultUserStatuses: SetNonNullable<UserStatusInMessage, "status">[] = [];
    const statusMap = new Map(foundUserStatuses.map((us) => [us.userId, us]));

    for (const userId of input) {
      const foundStatus = statusMap.get(userId);
      if (foundStatus) resultUserStatuses.push({ ...foundStatus, status: getDetectedUserStatus(foundStatus) });
      else
        // We'll conveniently assume that if they don't have a user status record yet
        // It means that they're still online as we insert a record as soon as they go offline
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
    }

    return resultUserStatuses;
  }),
  updateUser: standardAuthedProcedure.input(updateUserInputSchema).mutation(async ({ ctx, input }) => {
    const updatedUser = requireMutation(
      (await ctx.db.update(users).set(input).where(eq(users.id, ctx.getSessionPayload.user.id)).returning())[0],
      Operation.Update,
      DatabaseEntityType.User,
      ctx.getSessionPayload.user.id,
    );
    return updatedUser;
  }),
  generateProfileImageUploadUrl: standardAuthedProcedure.mutation(async ({ ctx }) => {
    const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
    const blobName = `${ctx.getSessionPayload.user.id}/ProfileImage`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const sasUrl = await blockBlobClient.generateSasUrl({
      expiresOn: dayjs().add(1, "hour").toDate(),
      permissions: ContainerSASPermissions.from({ write: true }),
    });
    return { publicUrl: blockBlobClient.url, sasUrl };
  }),
  upsertStatus: standardAuthedProcedure.input(upsertStatusInputSchema).mutation(async ({ ctx, input }) => {
    const upsertedStatus = requireMutation(
      (
        await ctx.db
          .insert(userStatusesInMessage)
          .values({ ...input, userId: ctx.getSessionPayload.user.id })
          .onConflictDoUpdate({
            set: input,
            target: userStatusesInMessage.userId,
          })
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.UserStatus,
      JSON.stringify(input),
    );

    const detectedStatus = { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) };
    userEventEmitter.emit("upsertStatus", detectedStatus);
    return detectedStatus;
  }),
});
