<script setup lang="ts">
import { AchievementStatus } from "#shared/models/achievement/AchievementStatus";
import { useAchievementStore } from "@/store/achievement";

const achievementStore = useAchievementStore();
const { achievementDefinitions, stats, userAchievements } = storeToRefs(achievementStore);
const achievementListMap = computed(() => {
  const unlockedUserAchievements = userAchievements.value.filter(({ unlockedAt }) => unlockedAt !== null);
  return {
    [AchievementStatus.All]: {
      achievementDefinitions: achievementDefinitions.value,
      userAchievements: userAchievements.value,
    },
    [AchievementStatus.Locked]: {
      achievementDefinitions: achievementDefinitions.value.filter(
        ({ name }) => !unlockedUserAchievements.some(({ achievement }) => achievement.name === name),
      ),
      userAchievements: userAchievements.value,
    },
    [AchievementStatus.Unlocked]: {
      achievementDefinitions: achievementDefinitions.value.filter(({ name }) =>
        unlockedUserAchievements.some(({ achievement }) => achievement.name === name),
      ),
      userAchievements: unlockedUserAchievements,
    },
  };
});
const tab = ref(AchievementStatus.All);
</script>

<template>
  <v-card>
    <v-card-title flex items-center>
      <v-icon icon="mdi-trophy" mr-2 />
      Achievements
      <v-spacer />
      <v-chip color="primary" size="small">{{ stats.unlockedAchievements }} / {{ stats.totalAchievements }}</v-chip>
    </v-card-title>
    <v-card-subtitle>Total Points: {{ stats.unlockedPoints }} / {{ stats.totalPoints }}</v-card-subtitle>
    <v-card-text>
      <v-progress-linear
        :model-value="(stats.unlockedAchievements / stats.totalAchievements) * 100"
        :height="8"
        color="primary"
        rounded
      />
      <v-tabs v-model="tab" mt-4>
        <v-tab v-for="key in Object.values(AchievementStatus)" :key :value="key">{{ key }}</v-tab>
      </v-tabs>
      <v-window v-model="tab" mt-4>
        <v-window-item v-for="key in Object.values(AchievementStatus)" :key py-2 :value="key">
          <AchievementGrid :="achievementListMap[key]" />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>
