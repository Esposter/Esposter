// @vitest-environment nuxt
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useUserSettingsStore } from "@/store/message/user/settings";
import {
  DEFAULT_AUTO_IDLE_THRESHOLD_MS,
  DEFAULT_INPUT_SENSITIVITY_DECIBELS,
  DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  NoiseSuppressionMode,
  VoiceInputMode,
} from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useUserSettingsStore, () => {
  const server = setupMswTrpc();
  const userSettings: UserSettingsInMessage = {
    autoIdleThresholdMs: DEFAULT_AUTO_IDLE_THRESHOLD_MS,
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    inputSensitivityDecibels: DEFAULT_INPUT_SENSITIVITY_DECIBELS,
    isDeafenOnJoin: false,
    isMuteOnJoin: false,
    microphoneVolumePercentage: DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
    noiseSuppressionMode: NoiseSuppressionMode.Custom,
    pushToTalkKeybind: "",
    pushToTalkReleaseDelayMs: DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
    speakerVolumePercentage: DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
    updatedAt: new Date("1970-01-01"),
    userId: crypto.randomUUID(),
    voiceInputMode: VoiceInputMode.VoiceActivity,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Every control on the settings surface writes this one record through one target, and the voice tab mounts
  // Most of them at once — an earlier change superseded by the next control's would skip its rollback and its
  // Alert, leaving a rejected value on screen as though it had saved
  test("surfaces a rejected change even when the next control saves straight after", async () => {
    expect.hasAssertions();

    let updateCount = 0;
    server.use(
      trpcMsw.user.readUserSettings.query(() => userSettings),
      trpcMsw.user.updateUserSettings.mutation(() => {
        updateCount += 1;
        // A distinct message per call, so the alert store keeps both instead of refreshing one
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(updateCount) });
      }),
    );
    const userSettingsStore = useUserSettingsStore();
    const { readUserSettings, updateUserSettings } = userSettingsStore;
    await readUserSettings();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await Promise.all([updateUserSettings({ isMuteOnJoin: true }), updateUserSettings({ isDeafenOnJoin: true })]);

    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["1", "2"]);
  });

  // Two controls write different fields of the same record, so both changes must survive — the second write
  // Reads the settings the first stored rather than the object it was holding when the user clicked
  test("keeps both queued field changes", async () => {
    expect.hasAssertions();

    const storedUserSettings = { ...userSettings };
    server.use(
      trpcMsw.user.readUserSettings.query(() => userSettings),
      trpcMsw.user.updateUserSettings.mutation(({ input }) => ({ ...Object.assign(storedUserSettings, input) })),
    );
    const userSettingsStore = useUserSettingsStore();
    const { readUserSettings, updateUserSettings } = userSettingsStore;
    await readUserSettings();
    await Promise.all([updateUserSettings({ isMuteOnJoin: true }), updateUserSettings({ isDeafenOnJoin: true })]);

    expect(userSettingsStore.userSettings).toStrictEqual({
      ...userSettings,
      isDeafenOnJoin: true,
      isMuteOnJoin: true,
    });
  });
});
