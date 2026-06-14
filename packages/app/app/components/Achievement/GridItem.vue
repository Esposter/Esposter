<script setup lang="ts">
import type { UserAchievementWithDefinition } from "#shared/models/achievement/UserAchievementWithDefinition";
import type { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";

import { getCategoryColor } from "@/services/achievement/getCategoryColor";
import { prettify } from "@/util/text/prettify";

interface GridItemProps {
  achievementDefinition: (typeof achievementDefinitions)[number];
  userAchievement?: UserAchievementWithDefinition;
}

const { achievementDefinition, userAchievement } = defineProps<GridItemProps>();
</script>

<template>
  <v-col cols="12" sm="6" md="4" lg="3">
    <StyledCard hover h-full cursor-auto>
      <v-card-text text-center flex flex-col h-full items-center>
        <v-avatar :color="userAchievement?.unlockedAt ? 'success' : 'grey'" size="64">
          <v-icon :icon="achievementDefinition.icon" color="white" size="40" />
        </v-avatar>
        <div font-bold mt-2 text-title-large>{{ prettify(achievementDefinition.name) }}</div>
        <div text-body-small>{{ achievementDefinition.description }}</div>
        <div v-if="userAchievement?.unlockedAt" text-gray font-bold mt-2 italic text-body-small>
          Unlocked {{ userAchievement.unlockedAt.toLocaleDateString() }}
        </div>
        <v-spacer />
        <v-chip mt-2 :color="getCategoryColor(achievementDefinition.category)" size="small">
          {{ achievementDefinition.category }}
        </v-chip>
        <div text-orange font-bold mt-2 text-body-small>{{ achievementDefinition.points }} points</div>
        <v-progress-linear
          :model-value="((userAchievement?.amount ?? 0) / (achievementDefinition.amount ?? 1)) * 100"
          :height="6"
          color="primary"
          mt-2
          rd
        />
        <div mt-1 text-body-small>{{ userAchievement?.amount ?? 0 }} / {{ achievementDefinition.amount ?? 1 }}</div>
      </v-card-text>
    </StyledCard>
  </v-col>
</template>
