<script setup lang="ts">
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
  <section flex flex-col gap-3>
    <div flex gap-2 items-center>
      <UiIcon :meaning="UiIconMeaning.Achievement" text-warning />
      <h2 truncate ui-heading>{{ totalPoints }} achievement points</h2>
      <span text-muted text-nowrap>{{ unlockedUserAchievements.length }} unlocked</span>
      <div flex-1 />
      <!-- Only when there is more than the summary is showing — otherwise it opens the same few again -->
      <UiButton
        v-if="unlockedUserAchievements.length > MAX_RECENT_ACHIEVEMENTS"
        aria-haspopup="dialog"
        @click="isOpen = true"
      >
        View all
        <UiIcon :meaning="UiIconMeaning.Next" />
      </UiButton>
    </div>
    <ul v-if="recentUserAchievements.length > 0" gap-4 grid cols-1 lg:cols-4 md:cols-3 sm:cols-2>
      <AchievementGridItem
        v-for="userAchievement of recentUserAchievements"
        :key="userAchievement.achievementId"
        :achievement-definition="userAchievement.achievement"
        :user-achievement
      />
    </ul>
    <UiDialog v-model="isOpen" title="Achievements" w="[min(64rem,90vw)]">
      <div p-3 min-h-0 of-y-auto>
        <AchievementGrid
          :achievement-definitions="unlockedAchievementDefinitions"
          :user-achievements="unlockedUserAchievements"
        />
      </div>
    </UiDialog>
  </section>
</template>
