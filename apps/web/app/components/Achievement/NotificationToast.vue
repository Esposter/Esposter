<script setup lang="ts">
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { TOAST_DURATION_MS } from "@/services/ui/constants";
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
  <UiToast :duration-ms="TOAST_DURATION_MS" is-dismissible status="success" @close="emit('close')">
    <template #mark>
      <v-icon :icon="userAchievement.achievement.icon" size="2rem" />
    </template>
    <div text-accent>Achievement unlocked</div>
    <div>{{ displayName }}</div>
    <div text-sm text-muted>{{ userAchievement.achievement.description }}</div>
    <div text-sm text-warning>+{{ userAchievement.achievement.points }} points</div>
    <!-- Unlocking one is the moment someone first wants the rest of them, and the toast is the only thing on screen
      That knows it happened — Steam and Xbox both hang the gallery off it -->
    <template #actions>
      <NuxtInvisibleLink :to="RoutePath.Achievements" text-info hover:underline @click="emit('close')">
        View all
      </NuxtInvisibleLink>
    </template>
  </UiToast>
</template>
