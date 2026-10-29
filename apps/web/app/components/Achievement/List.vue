<script setup lang="ts">
import { AchievementSort } from "@/models/achievement/AchievementSort";
import { AchievementStatus, AchievementStatuses } from "@/models/achievement/AchievementStatus";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AchievementSortItems } from "@/services/achievement/AchievementSortItems";
import { AchievementStatusItems } from "@/services/achievement/AchievementStatusItems";
import { getAchievementListMap } from "@/services/achievement/getAchievementListMap";
import { sortAchievementDefinitions } from "@/services/achievement/sortAchievementDefinitions";
import { TAB_QUERY_PARAMETER_KEY } from "@/services/route/constants";
import { useAchievementStore } from "@/store/achievement";

const achievementStore = useAchievementStore();
const { achievementDefinitions, statistics, userAchievements } = storeToRefs(achievementStore);
const { $trpc } = useNuxtApp();
const { data: achievementNameRarityMap } = useQuery(() => $trpc.achievement.readAchievementRarities.query());
const sort = ref(AchievementSort.Category);
const displayAchievementDefinitions = computed(() =>
  sortAchievementDefinitions(achievementDefinitions.value, sort.value, achievementNameRarityMap.value),
);
const achievementListMap = computed(() =>
  getAchievementListMap(displayAchievementDefinitions.value, userAchievements.value),
);
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
    <div flex justify-end>
      <UiSelect v-model="sort" :items="AchievementSortItems" label="Sort achievements" />
    </div>
    <UiTabs v-model="tab" :items="AchievementStatusItems" label="Which achievements">
      <template #default="{ value }">
        <UiEmptyState
          v-if="achievementListMap[value].achievementDefinitions.length === 0"
          :description="value === AchievementStatus.Unlocked ? 'One shows up here the moment you earn it.' : undefined"
          :meaning="UiIconMeaning.Achievement"
          :title="value === AchievementStatus.Unlocked ? 'Nothing unlocked yet' : 'Every achievement unlocked'"
        />
        <AchievementGrid v-else :="achievementListMap[value]" :achievement-name-rarity-map />
      </template>
    </UiTabs>
  </section>
</template>
