<script setup lang="ts">
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { MAX_RECENT_ACHIEVEMENTS } from "@/services/achievement/constants";
import { getUnlockedUserAchievements } from "@/services/achievement/getUnlockedUserAchievements";

interface Props {
  userAchievements: UserAchievementWithDefinition[];
}

const { userAchievements } = defineProps<Props>();
const unlockedUserAchievements = computed(() => getUnlockedUserAchievements(userAchievements));
// The read is public and scoped to the profile's own user, so the whole list is already here — the dialog is
// The rest of what the summary is truncating, about the user on screen, the way GitHub opens a profile's
// Achievements over the profile rather than sending the reader to a page about themselves
const unlockedAchievementDefinitions = computed(() =>
  unlockedUserAchievements.value.map(({ achievement }) => achievement),
);
const totalPoints = computed(() =>
  unlockedUserAchievements.value.reduce((total, { achievement }) => total + achievement.points, 0),
);
const recentUserAchievements = computed(() =>
  unlockedUserAchievements.value
    .toSorted((first, second) => (second.unlockedAt?.getTime() ?? 0) - (first.unlockedAt?.getTime() ?? 0))
    .slice(0, MAX_RECENT_ACHIEVEMENTS),
);
const isOpen = ref(false);
</script>

<template>
  <div flex flex-col gap-y-3>
    <div flex gap-x-2 items-center>
      <v-icon color="orange" icon="mdi-trophy" />
      <span font-bold text-title-large>{{ totalPoints }} achievement points</span>
      <span text-hint>{{ unlockedUserAchievements.length }} unlocked</span>
      <v-spacer />
      <!-- Only when there is more than the summary is showing — otherwise it opens the same few again -->
      <v-btn
        v-if="unlockedUserAchievements.length > MAX_RECENT_ACHIEVEMENTS"
        append-icon="mdi-chevron-right"
        size="small"
        text="View all"
        variant="text"
        @click="isOpen = true"
      />
    </div>
    <v-row v-if="recentUserAchievements.length > 0">
      <AchievementGridItem
        v-for="userAchievement of recentUserAchievements"
        :key="userAchievement.achievementId"
        :achievement-definition="userAchievement.achievement"
        :user-achievement
      />
    </v-row>
    <StyledDialog v-model="isOpen" :card-props="{ prependIcon: 'mdi-trophy', title: 'Achievements' }">
      <AchievementGrid
        :achievement-definitions="unlockedAchievementDefinitions"
        :user-achievements="unlockedUserAchievements"
      />
    </StyledDialog>
  </div>
</template>
