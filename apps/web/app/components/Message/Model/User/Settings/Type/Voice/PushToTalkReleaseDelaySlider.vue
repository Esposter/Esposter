<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_PUSH_TO_TALK_RELEASE_DELAY_MS, MIN_PUSH_TO_TALK_RELEASE_DELAY_MS } from "@esposter/db-schema";

interface Props {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<Props>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: editedPushToTalkReleaseDelayMs } = useCloned(() => userSettings.pushToTalkReleaseDelayMs);
</script>

<template>
  <UiSlider
    v-model="editedPushToTalkReleaseDelayMs"
    label="Push to talk release delay"
    :max="MAX_PUSH_TO_TALK_RELEASE_DELAY_MS"
    :min="MIN_PUSH_TO_TALK_RELEASE_DELAY_MS"
    :step="10"
    :value-text="`${editedPushToTalkReleaseDelayMs} ms`"
    @end="(pushToTalkReleaseDelayMs) => updateUserSettings({ pushToTalkReleaseDelayMs })"
  />
</template>
