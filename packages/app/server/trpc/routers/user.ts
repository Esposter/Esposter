import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { User, UserSettingsInMessage, UserStatusInMessage } from "@esposter/db-schema";
import type { SetNonNullable } from "type-fest";

import { readUserInputSchema } from "#shared/models/db/user/ReadUserInput";
import { updateUserInputSchema } from "#shared/models/db/user/UpdateUserInput";
import { updateUserSettingsInputSchema } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { on } from "@@/server/services/events/on";
import { getDetectedUserStatus } from "@@/server/services/message/getDetectedUserStatus";
import { userEventEmitter } from "@@/server/services/user/events/userEventEmitter";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { generateWriteSasUrl } from "@esposter/db";
import {
  AzureContainer,
  DatabaseEntityType,
  DEFAULT_AUTO_IDLE_THRESHOLD_MS,
  DEFAULT_INPUT_SENSITIVITY_DECIBELS,
  DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  NoiseSuppressionMode,
  selectUserStatusInMessageSchema,
  userIdsSchema,
  users,
  userSettingsInMessage,
  UserStatus,
  userStatusesInMessage,
  VoiceInputMode,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { eq, inArray } from "drizzle-orm";

// The status reads and the status subscription all address the same thing: a non-empty set of other users
const userStatusIdsInputSchema = userIdsSchema.shape.userIds.min(1);

const upsertStatusInputSchema = refineAtLeastOne(
  selectUserStatusInMessageSchema.pick({ message: true, status: true }).partial(),
  ["message", "status"],
);
// Connecting and disconnecting are one upsert of the same column, so the row and the emit are written once
const setConnectedStatus = async (ctx: AuthedContext, isConnected: boolean) => {
  const upsertedStatus = requireMutation(
    (
      await ctx.db
        .insert(userStatusesInMessage)
        .values({ isConnected, userId: ctx.getSessionPayload.user.id })
        .onConflictDoUpdate({ set: { isConnected }, target: userStatusesInMessage.userId })
        .returning()
    )[0],
    Operation.Update,
    DatabaseEntityType.UserStatus,
    JSON.stringify({ isConnected }),
  );

  userEventEmitter.emit("upsertStatus", { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) });
};

export const userRouter = router({
  connect: standardAuthedProcedure.mutation<void>(({ ctx }) => setConnectedStatus(ctx, true)),
  disconnect: standardAuthedProcedure.mutation<void>(({ ctx }) => setConnectedStatus(ctx, false)),
  generateProfileImageUploadUrl: standardAuthedProcedure.mutation(async ({ ctx }) => {
    const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
    const blobName = `${ctx.getSessionPayload.user.id}/ProfileImage`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const sasUrl = await generateWriteSasUrl(blockBlobClient);
    return { publicUrl: blockBlobClient.url, sasUrl };
  }),
  onUpsertStatus: standardAuthedProcedure.input(userStatusIdsInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    if (input.includes(ctx.getSessionPayload.user.id))
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserStatus, JSON.stringify(input));

    for await (const [data] of on(userEventEmitter, "upsertStatus", { signal })) {
      if (!input.includes(data.userId)) continue;
      yield data;
    }
  }),
  readStatuses: standardAuthedProcedure.input(userStatusIdsInputSchema).query(async ({ ctx, input }) => {
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
  // Public profile identity — projects only the allowlisted columns so private fields (email) never
  // Leave the database, and runs unauthenticated on the rate-limited procedure
  readUser: standardRateLimitedProcedure
    .input(readUserInputSchema)
    .query<Pick<User, "biography" | "image" | "name">>(({ ctx, input }) =>
      requireEntity(
        ctx.db.query.users.findFirst({
          columns: { biography: true, image: true, name: true },
          where: { id: { eq: input } },
        }),
        DatabaseEntityType.User,
        input,
      ),
    ),
  readUserSettings: standardAuthedProcedure.query(async ({ ctx }) => {
    const foundUserSettings = (
      await ctx.db
        .select()
        .from(userSettingsInMessage)
        .where(eq(userSettingsInMessage.userId, ctx.getSessionPayload.user.id))
    )[0];
    if (foundUserSettings) return foundUserSettings;
    // No row yet — return the defaults without persisting; the first update upserts the row
    return {
      autoIdleThresholdMs: DEFAULT_AUTO_IDLE_THRESHOLD_MS,
      createdAt: new Date(),
      deletedAt: null,
      inputSensitivityDecibels: DEFAULT_INPUT_SENSITIVITY_DECIBELS,
      isDeafenOnJoin: false,
      isMuteOnJoin: false,
      microphoneVolumePercentage: DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
      noiseSuppressionMode: NoiseSuppressionMode.Custom,
      pushToTalkKeybind: "",
      pushToTalkReleaseDelayMs: DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
      speakerVolumePercentage: DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
      updatedAt: new Date(),
      userId: ctx.getSessionPayload.user.id,
      voiceInputMode: VoiceInputMode.VoiceActivity,
    } satisfies UserSettingsInMessage;
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
  updateUserSettings: standardAuthedProcedure.input(updateUserSettingsInputSchema).mutation(async ({ ctx, input }) =>
    requireMutation(
      (
        await ctx.db
          .insert(userSettingsInMessage)
          .values({ ...input, userId: ctx.getSessionPayload.user.id })
          .onConflictDoUpdate({ set: input, target: userSettingsInMessage.userId })
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.UserSettings,
      JSON.stringify(input),
    ),
  ),
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
