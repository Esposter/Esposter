<script setup lang="ts">
import type { UserAchievementWithDefinition } from "#shared/models/achievement/UserAchievementWithDefinition";

import { prettify } from "@/util/text/prettify";

interface NotificationListItemProps {
  userAchievement: UserAchievementWithDefinition;
}

const { userAchievement } = defineProps<NotificationListItemProps>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <v-snackbar
    :model-value="true"
    :timeout="5000"
    color="success"
    location="top right"
    variant="elevated"
    @update:model-value="
      (value) => {
        if (value) return;
        emit('close');
      }
    "
  >
    <div flex items-center>
      <v-icon mr-3 :icon="userAchievement.achievement.icon" size="large" />
      <div>
        <div font-bold text-title-large>Achievement Unlocked!</div>
        <div text-body-large>{{ prettify(userAchievement.achievement.name) }}</div>
        <div text-body-small>{{ userAchievement.achievement.description }}</div>
        <div text-orange font-bold text-body-small>+{{ userAchievement.achievement.points }} points</div>
      </div>
    </div>
  </v-snackbar>
</template>
