<script setup lang="ts">
import { AchievementStatus, AchievementStatuses } from "@/models/achievement/AchievementStatus";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AchievementStatusItems } from "@/services/achievement/AchievementStatusItems";
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
  <section flex flex-col gap-4>
    <div flex gap-3 items-center>
      <UiLoadingBar
        label="Achievements unlocked"
        :value="(statistics.unlockedAchievements / statistics.totalAchievements) * 100"
        flex-1
      />
      <p text-sm text-nowrap>
        {{ statistics.unlockedAchievements }} / {{ statistics.totalAchievements }} unlocked ·
        <span text-warning>{{ statistics.unlockedPoints }} / {{ statistics.totalPoints }} points</span>
      </p>
    </div>
    <UiTabs v-model="tab" :items="AchievementStatusItems" label="Which achievements">
      <template #default="{ value }">
        <UiEmptyState
          v-if="achievementListMap[value].achievementDefinitions.length === 0"
          :description="value === AchievementStatus.Unlocked ? 'One shows up here the moment you earn it.' : undefined"
          :meaning="UiIconMeaning.Achievement"
          :title="value === AchievementStatus.Unlocked ? 'Nothing unlocked yet' : 'Every achievement unlocked'"
        />
        <AchievementGrid v-else :="achievementListMap[value]" />
      </template>
    </UiTabs>
  </section>
</template>
