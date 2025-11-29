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
    <StyledCard h-full hover cursor-auto>
      <v-card-text h-full flex flex-col items-center text-center>
        <v-avatar :color="userAchievement?.unlockedAt ? 'success' : 'grey'" size="64">
          <v-icon :icon="achievementDefinition.icon" color="white" size="40" />
        </v-avatar>
        <div class="text-h6" mt-2 font-bold>{{ prettify(achievementDefinition.name) }}</div>
        <div class="text-caption">{{ achievementDefinition.description }}</div>
        <v-spacer />
        <v-chip mt-2 :color="getCategoryColor(achievementDefinition.category)" size="small">
          {{ achievementDefinition.category }}
        </v-chip>
        <div mt-2 class="text-caption" text-orange font-bold>{{ achievementDefinition.points }} points</div>
        <v-progress-linear
          :model-value="((userAchievement?.amount ?? 0) / (achievementDefinition.amount ?? 1)) * 100"
          mt-2
          :height="6"
          color="primary"
          rounded
        />
        <div class="text-caption" mt-1>
          {{ userAchievement?.amount ?? 0 }} / {{ achievementDefinition.amount ?? 1 }}
        </div>
        <div v-if="userAchievement?.unlockedAt" class="text-caption" mt-2 text-gray>
          Unlocked {{ userAchievement.unlockedAt.toLocaleDateString() }}
        </div>
      </v-card-text>
    </StyledCard>
  </v-col>
</template>
