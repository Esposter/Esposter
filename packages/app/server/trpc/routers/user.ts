import type { ReadableStream } from "node:stream/web";
import type { z } from "zod/v4";

import { sessions } from "#shared/db/schema/sessions";
import { selectUserSchema, users } from "#shared/db/schema/users";
import { selectUserStatusSchema, userStatuses } from "#shared/db/schema/userStatuses";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { UserStatus } from "#shared/models/db/UserStatus";
import { dayjs } from "#shared/services/dayjs";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { userEventEmitter } from "@@/server/services/esbabbler/events/userEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { octetInputParser } from "@trpc/server/http";
import { eq, inArray } from "drizzle-orm";
import { Readable } from "node:stream";
import { DatabaseEntityType } from "~~/shared/models/entity/DatabaseEntityType";

const readStatusesInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type ReadStatusesInput = z.infer<typeof readStatusesInputSchema>;

const updateStatusInputSchema = selectUserStatusSchema.shape.status;
export type UpdateStatusInput = z.infer<typeof updateStatusInputSchema>;

const onUpdateStatusInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnUpdateStatusInput = z.infer<typeof onUpdateStatusInputSchema>;

export const userRouter = router({
  onUpdateStatus: authedProcedure.input(onUpdateStatusInputSchema).subscription(async function* ({ input, signal }) {
    for await (const [data] of on(userEventEmitter, "updateStatus", { signal })) {
      if (!input.includes(data.userId)) continue;
      yield data;
    }
  }),
  readStatuses: authedProcedure.input(readStatusesInputSchema).query(async ({ ctx, input }) => {
    const statuses = await ctx.db
      .select({
        sessionExpiresAt: sessions.expiresAt,
        status: userStatuses.status,
        statusExpiresAt: userStatuses.expiresAt,
        userId: userStatuses.userId,
      })
      .from(userStatuses)
      .leftJoin(sessions, eq(sessions.userId, userStatuses.userId))
      .where(inArray(userStatuses.userId, input));
    const cutoffDate = new Date();
    const resultUserStatuses: UserStatus[] = [];

    for (const userId of input) {
      const foundStatus = statuses.find((s) => s.userId === userId);
      // We'll conveniently assume that if they don't have a user status record yet
      // it means that they're still online as we insert a record as soon as they go offline
      if (!foundStatus) {
        resultUserStatuses.push(UserStatus.Online);
        continue;
      }

      const { sessionExpiresAt, status, statusExpiresAt } = foundStatus;
      resultUserStatuses.push(
        status && (!statusExpiresAt || dayjs(statusExpiresAt).isAfter(cutoffDate))
          ? status
          : // Auto detect the user status based on the session expire date
            dayjs(sessionExpiresAt).isAfter(cutoffDate)
            ? UserStatus.Online
            : UserStatus.Offline,
      );
    }

    return resultUserStatuses;
  }),
  updateStatus: authedProcedure.input(updateStatusInputSchema).mutation(async ({ ctx, input }) => {
    const lastActiveAt = input === UserStatus.Offline ? new Date() : undefined;
    const updatedStatus = (
      await ctx.db
        .insert(userStatuses)
        .values({ lastActiveAt, status: input, userId: ctx.session.user.id })
        .onConflictDoUpdate({
          set: { lastActiveAt, status: input },
          target: users.id,
        })
        .returning()
    ).find(Boolean);
    if (!updatedStatus)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.UserStatus, JSON.stringify(input))
          .message,
      });
    userEventEmitter.emit("updateStatus", updatedStatus);
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
});
