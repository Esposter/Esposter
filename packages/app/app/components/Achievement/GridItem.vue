<script setup lang="ts">
import type { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { CategoryColorMap } from "@/services/achievement/CategoryColorMap";
import { prettify } from "@/util/text/prettify";

interface GridItemProps {
  achievementDefinition: (typeof achievementDefinitions)[number];
  userAchievement?: UserAchievementWithDefinition;
}

const { achievementDefinition, userAchievement } = defineProps<GridItemProps>();
const displayName = computed(() => prettify(achievementDefinition.name));
</script>

<template>
  <v-col cols="12" sm="6" md="4" lg="3">
    <StyledCard hover h-full cursor-auto>
      <v-card-text text-center flex flex-col gap-y-2 h-full items-center>
        <v-avatar :color="userAchievement?.unlockedAt ? 'success' : 'grey'" size="4rem">
          <v-icon :icon="achievementDefinition.icon" color="white" size="2.5rem" />
        </v-avatar>
        <div>
          <div font-bold text-title-large>{{ displayName }}</div>
          <div text-body-small>{{ achievementDefinition.description }}</div>
        </div>
        <div v-if="userAchievement?.unlockedAt" font-bold italic text-hint>
          Unlocked <NuxtTime :datetime="userAchievement.unlockedAt" day="numeric" month="numeric" year="numeric" />
        </div>
        <v-spacer />
        <v-chip :color="CategoryColorMap[achievementDefinition.category]" size="small">
          {{ achievementDefinition.category }}
        </v-chip>
        <div text-orange font-bold text-body-small>{{ achievementDefinition.points }} points</div>
        <div flex flex-col gap-y-1 w-full>
          <v-progress-linear
            :model-value="((userAchievement?.amount ?? 0) / (achievementDefinition.amount ?? 1)) * 100"
            :height="6"
            color="primary"
            rd
          />
          <div text-body-small>{{ userAchievement?.amount ?? 0 }} / {{ achievementDefinition.amount ?? 1 }}</div>
        </div>
      </v-card-text>
    </StyledCard>
  </v-col>
</template>
