<script setup lang="ts">
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { prettify } from "@/util/text/prettify";
import { RoutePath } from "@esposter/shared";

interface Props {
  userAchievement: UserAchievementWithDefinition;
}

const { userAchievement } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const displayName = computed(() => prettify(userAchievement.achievement.name));
</script>

<template>
  <v-snackbar
    :model-value="true"
    color="success"
    @update:model-value="
      (value) => {
        if (value) return;
        emit('close');
      }
    "
  >
    <div flex gap-x-3 items-center>
      <v-icon :icon="userAchievement.achievement.icon" size="large" />
      <div>
        <div font-bold text-title-large>Achievement Unlocked!</div>
        <div text-body-large>{{ displayName }}</div>
        <div text-body-small>{{ userAchievement.achievement.description }}</div>
        <div text-orange font-bold text-body-small>+{{ userAchievement.achievement.points }} points</div>
      </div>
    </div>
    <!-- Unlocking one is the moment someone first wants the rest of them, and the toast is the only thing on
      Screen that knows it happened — Steam and Xbox both hang the gallery off it. Without this the gallery is
      Reachable only from the More dropdown, which is nowhere near the want -->
    <template #actions>
      <v-btn text="View all" variant="text" :to="RoutePath.Achievements" @click="emit('close')" />
    </template>
  </v-snackbar>
</template>
