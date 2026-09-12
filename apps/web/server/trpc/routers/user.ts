import type { CallBackground } from "#shared/models/message/call/CallBackground";
import type { CallBackgroundBlob } from "@@/server/models/message/call/CallBackgroundBlob";
import type { User, UserSettingsInMessage, UserStatusInMessage } from "@esposter/db-schema";
import type { SetNonNullable } from "type-fest";

import { generateCallBackgroundUploadUrlInputSchema } from "#shared/models/db/user/GenerateCallBackgroundUploadUrlInput";
import { readUserInputSchema } from "#shared/models/db/user/ReadUserInput";
import { updateUserInputSchema } from "#shared/models/db/user/UpdateUserInput";
import { upsertStatusInputSchema } from "#shared/models/db/user/UpsertStatusInput";
import { userStatusIdsInputSchema } from "#shared/models/db/user/UserStatusIdsInput";
import { updateUserSettingsInputSchema } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import { callBackgroundSlotSchema } from "#shared/models/message/call/CallBackgroundSlot";
import { MAX_CALL_BACKGROUND_SIZE_BYTES } from "#shared/services/message/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "@@/server/services/azure/eventGrid/publishBlobPrefixDeletion";
import { on } from "@@/server/services/events/on";
import { checkIsServableCallBackground } from "@@/server/services/message/call/checkIsServableCallBackground";
import { getCallBackgroundBlobName } from "@@/server/services/message/call/getCallBackgroundBlobName";
import { readCallBackgroundBlobs } from "@@/server/services/message/call/readCallBackgroundBlobs";
import { getDetectedUserStatus } from "@@/server/services/message/getDetectedUserStatus";
import { userEventEmitter } from "@@/server/services/user/events/userEventEmitter";
import { upsertConnectedStatus } from "@@/server/services/user/upsertConnectedStatus";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { generateReadSasUrl, generateWriteSasUrl } from "@esposter/db";
import {
  AzureContainer,
  DatabaseEntityType,
  DEFAULT_AUTO_IDLE_THRESHOLD_MS,
  DEFAULT_INPUT_SENSITIVITY_DECIBELS,
  DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  getMimeCategory,
  MimeCategory,
  NoiseSuppressionMode,
  users,
  userSettingsInMessage,
  UserStatus,
  userStatusesInMessage,
  VoiceInputMode,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { eq } from "drizzle-orm";

export const userRouter = router({
  connect: standardAuthedProcedure.mutation<void>(({ ctx }) => upsertConnectedStatus(ctx, true)),
  deleteCallBackground: standardAuthedProcedure
    .input(callBackgroundSlotSchema)
    .mutation<void>(async ({ ctx, input: { slot } }) => {
      const userId = ctx.getSessionPayload.user.id;
      // Published as a bounded prefix rather than as the name itself, because a slot's name is fixed: a replace
      // And a delete address the same blob, so a redelivered delete would take the replacement with it. The
      // Bound is the instant the delete was decided, so a slot re-uploaded after it keeps its new image and the
      // Worst case is a blob nothing points at rather than a background that vanishes after being replaced.
      // The settings row keeps naming a slot that no longer resolves, which the picker already renders as no
      // Background - so there is nothing to unwind here and no cleanup pass to schedule
      await publishBlobPrefixDeletion(
        userId,
        AzureContainer.PrivateUserAssets,
        getCallBackgroundBlobName(userId, slot),
        new Date(),
      );
    }),
  disconnect: standardAuthedProcedure.mutation<void>(({ ctx }) => upsertConnectedStatus(ctx, false)),
  generateCallBackgroundUploadUrl: standardAuthedProcedure
    .input(generateCallBackgroundUploadUrlInputSchema)
    .mutation<string>(async ({ ctx, input: { mimetype, size, slot } }) => {
      if (size > MAX_CALL_BACKGROUND_SIZE_BYTES || getMimeCategory(mimetype) !== MimeCategory.Image)
        throw getInvalidOperationError(
          Operation.Create,
          DatabaseEntityType.CallBackground,
          JSON.stringify({ mimetype, size }),
        );

      const containerClient = await useContainerClient(AzureContainer.PrivateUserAssets);
      // No listing stands between the request and the target: the slot is already bounded by its schema, and a
      // Count read here could only ever be out of date - a delete is reclaimed by a worker, so a slot freed a
      // Moment ago would still read as taken and refuse the replacement the user just made room for
      const blockBlobClient = containerClient.getBlockBlobClient(
        getCallBackgroundBlobName(ctx.getSessionPayload.user.id, slot),
      );
      return generateWriteSasUrl(blockBlobClient, { contentType: mimetype });
    }),
  generateProfileImageUploadUrl: standardAuthedProcedure.mutation<{ publicUrl: string; sasUrl: string }>(
    async ({ ctx }) => {
      const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
      const blobName = `${ctx.getSessionPayload.user.id}/ProfileImage`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const sasUrl = await generateWriteSasUrl(blockBlobClient);
      return { publicUrl: blockBlobClient.url, sasUrl };
    },
  ),
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
  readCallBackgrounds: standardAuthedProcedure.query<CallBackground[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const containerClient = await useContainerClient(AzureContainer.PrivateUserAssets);
    const callBackgroundBlobs = await readCallBackgroundBlobs(containerClient, userId);
    // Partitioned in one pass rather than filtered twice, so the cap is applied to each slot exactly once
    const servableCallBackgroundBlobs: CallBackgroundBlob[] = [];
    const unservableBlobNames: string[] = [];
    for (const callBackgroundBlob of callBackgroundBlobs)
      if (checkIsServableCallBackground(callBackgroundBlob)) servableCallBackgroundBlobs.push(callBackgroundBlob);
      else unservableBlobNames.push(callBackgroundBlob.name);
    // A slot that came back over the cap is dropped from what the picker receives and reclaimed through the
    // Same event every other blob delete goes through. Best-effort: a dropped publish only leaves a slot
    // Occupied by a blob nothing will ever hand out
    await publishBlobDeletion(userId, AzureContainer.PrivateUserAssets, unservableBlobNames);
    return Promise.all(
      servableCallBackgroundBlobs.map(async ({ name, slot }) => ({
        sasUrl: await generateReadSasUrl(containerClient.getBlockBlobClient(name)),
        slot,
      })),
    );
  }),
  readStatuses: standardAuthedProcedure
    .input(userStatusIdsInputSchema)
    .query<SetNonNullable<UserStatusInMessage, "status">[]>(async ({ ctx, input }) => {
      const foundUserStatuses = await ctx.db.query.userStatusesInMessage.findMany({ where: { userId: { in: input } } });
      const resultUserStatuses: SetNonNullable<UserStatusInMessage, "status">[] = [];
      const statusMap = new Map(foundUserStatuses.map((userStatus) => [userStatus.userId, userStatus]));

      for (const userId of input) {
        const foundStatus = statusMap.get(userId);
        if (foundStatus) resultUserStatuses.push({ ...foundStatus, status: getDetectedUserStatus(foundStatus) });
        else
          // A user with no status row is treated as online: a row is inserted the moment they go offline, so
          // Its absence is the only state left
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
  readUserSettings: standardAuthedProcedure.query<UserSettingsInMessage>(async ({ ctx }) => {
    const foundUserSettings = await ctx.db.query.userSettingsInMessage.findFirst({
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
    });
    if (foundUserSettings) return foundUserSettings;
    // No row yet — return the defaults without persisting; the first update upserts the row
    else
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
        virtualBackground: "",
        voiceInputMode: VoiceInputMode.VoiceActivity,
      } satisfies UserSettingsInMessage;
  }),
  updateUser: standardAuthedProcedure
    .input(updateUserInputSchema)
    .mutation<User>(async ({ ctx, input }) =>
      requireMutation(
        (await ctx.db.update(users).set(input).where(eq(users.id, ctx.getSessionPayload.user.id)).returning())[0],
        Operation.Update,
        DatabaseEntityType.User,
        ctx.getSessionPayload.user.id,
      ),
    ),
  updateUserSettings: standardAuthedProcedure
    .input(updateUserSettingsInputSchema)
    .mutation<UserSettingsInMessage>(async ({ ctx, input }) =>
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
  upsertStatus: standardAuthedProcedure
    .input(upsertStatusInputSchema)
    .mutation<SetNonNullable<UserStatusInMessage, "status">>(async ({ ctx, input }) => {
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
