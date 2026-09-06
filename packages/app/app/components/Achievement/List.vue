<script setup lang="ts">
import { AchievementStatus, AchievementStatuses } from "@/models/achievement/AchievementStatus";
import { getUnlockedUserAchievements } from "@/services/achievement/getUnlockedUserAchievements";
import { TAB_QUERY_PARAMETER_KEY } from "@/services/route/constants";
import { useAchievementStore } from "@/store/achievement";

const achievementStore = useAchievementStore();
const { achievementDefinitions, statistics, userAchievements } = storeToRefs(achievementStore);
const achievementListMap = computed(() => {
  const unlockedUserAchievements = getUnlockedUserAchievements(userAchievements.value);
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
const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, AchievementStatuses, AchievementStatus.All);
</script>

<template>
  <StyledCard>
    <v-card-title flex gap-x-2 items-center>
      <v-icon icon="mdi-trophy" />
      Achievements
      <v-spacer />
      <v-chip color="primary" size="small"
        >{{ statistics.unlockedAchievements }} / {{ statistics.totalAchievements }}</v-chip
      >
    </v-card-title>
    <v-card-subtitle>Total Points: {{ statistics.unlockedPoints }} / {{ statistics.totalPoints }}</v-card-subtitle>
    <v-card-text>
      <v-progress-linear
        :model-value="(statistics.unlockedAchievements / statistics.totalAchievements) * 100"
        height="0.5rem"
        color="primary"
        rd
      />
      <v-tabs v-model="tab" mt-4>
        <v-tab v-for="key in AchievementStatuses" :key :value="key">{{ key }}</v-tab>
      </v-tabs>
      <v-window v-model="tab" mt-4>
        <v-window-item v-for="key in AchievementStatuses" :key py-2 :value="key">
          <AchievementGrid :="achievementListMap[key]" />
        </v-window-item>
      </v-window>
    </v-card-text>
  </StyledCard>
</template>
