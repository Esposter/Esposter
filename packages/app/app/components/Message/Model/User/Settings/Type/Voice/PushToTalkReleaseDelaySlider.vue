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
  <div flex flex-col gap-y-1>
    <div text-body-medium>Push to Talk Release Delay</div>
    <div text-body-small>{{ editedPushToTalkReleaseDelayMs }}ms</div>
    <v-slider
      v-model="editedPushToTalkReleaseDelayMs"
      :max="MAX_PUSH_TO_TALK_RELEASE_DELAY_MS"
      :min="MIN_PUSH_TO_TALK_RELEASE_DELAY_MS"
      :step="10"
      @end="updateUserSettings({ pushToTalkReleaseDelayMs: $event })"
    />
  </div>
</template>
