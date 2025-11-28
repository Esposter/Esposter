<script setup lang="ts">
import type { achievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

import { getCategoryColor } from "@/services/achievement/getCategoryColor";

interface GridItemProps {
  achievementDefinition: (typeof achievementDefinitions)[number];
  userAchievement?: UserAchievementWithRelations;
}

const { achievementDefinition, userAchievement } = defineProps<GridItemProps>();
</script>

<template>
  <v-col cols="12" sm="6" md="4" lg="3">
    <v-card :disabled="!userAchievement?.unlockedAt" hover>
      <v-card-text text-center>
        <v-avatar mb-2 :color="userAchievement?.unlockedAt ? 'success' : 'grey'" size="64">
          <v-icon :icon="achievementDefinition.icon" size="40" color="white" />
        </v-avatar>
        <div class="text-h6" font-bold>{{ achievementDefinition.name }}</div>
        <div class="text-caption" mb-2 text-gray>{{ achievementDefinition.description }}</div>
        <v-chip mb-2 :color="getCategoryColor(achievementDefinition.category)" size="small">
          {{ achievementDefinition.category }}
        </v-chip>
        <div class="text-caption" text-yellow font-bold>{{ achievementDefinition.points }} points</div>
        <div v-if="achievementDefinition.amount && !userAchievement?.unlockedAt" mt-2>
          <v-progress-linear
            :model-value="(userAchievement?.amount ?? 0 / achievementDefinition.amount) * 100"
            :height="6"
            color="primary"
            rounded
          />
          <div class="text-caption" mt-1>{{ userAchievement?.amount ?? 0 }} / {{ achievementDefinition.amount }}</div>
        </div>
        <div v-if="userAchievement?.unlockedAt" class="text-caption" mt-2 text-gray>
          Unlocked {{ new Date(userAchievement.unlockedAt).toLocaleDateString() }}
        </div>
      </v-card-text>
    </v-card>
  </v-col>
</template>
