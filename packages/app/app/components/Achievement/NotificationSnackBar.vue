<script setup lang="ts">
import type { UserAchievementWithDefinition } from "#shared/models/achievement/UserAchievementWithDefinition";

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
        <div class="text-h6" font-bold>Achievement Unlocked!</div>
        <div class="text-subtitle-1">{{ userAchievement.achievement.name }}</div>
        <div class="text-caption">{{ userAchievement.achievement.description }}</div>
        <div class="text-caption" text-orange font-bold>+{{ userAchievement.achievement.points }} points</div>
      </div>
    </div>
  </v-snackbar>
</template>
