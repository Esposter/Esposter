// @vitest-environment nuxt
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
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
