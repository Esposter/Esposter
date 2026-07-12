<script setup lang="ts">
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useUserSettingsStore } from "@/store/message/user/settings";
import { MAX_PUSH_TO_TALK_RELEASE_DELAY_MS, MIN_PUSH_TO_TALK_RELEASE_DELAY_MS } from "@esposter/db-schema";

interface PushToTalkReleaseDelaySliderProps {
  userSettings: UserSettingsInMessage;
}

const { userSettings } = defineProps<PushToTalkReleaseDelaySliderProps>();
const userSettingsStore = useUserSettingsStore();
const { updateUserSettings } = userSettingsStore;
const { cloned: pushToTalkReleaseDelayMs } = useCloned(() => userSettings.pushToTalkReleaseDelayMs);
</script>

<template>
  <div mt-4 mb-1 text-body-medium>Push to Talk Release Delay</div>
  <div mb-2 text-body-small>{{ pushToTalkReleaseDelayMs }}ms</div>
  <v-slider
    v-model="pushToTalkReleaseDelayMs"
    :max="MAX_PUSH_TO_TALK_RELEASE_DELAY_MS"
    :min="MIN_PUSH_TO_TALK_RELEASE_DELAY_MS"
    :step="10"
    hide-details
    @end="updateUserSettings({ pushToTalkReleaseDelayMs: $event })"
  />
</template>
