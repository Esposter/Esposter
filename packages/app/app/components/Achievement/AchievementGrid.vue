<script setup lang="ts">
import type { achievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";
import type { Achievement, UserAchievement } from "@esposter/db-schema";

import { getCategoryColor } from "@/services/achievement/getCategoryColor";

interface AchievementGridProps {
  achievements: (UserAchievement & { achievement: (typeof achievementDefinitions)[number] & Achievement })[];
}

const { achievements } = defineProps<AchievementGridProps>();
</script>

<template>
  <v-row>
    <v-col v-for="{ achievement, id, amount, unlockedAt } in achievements" :key="id" cols="12" sm="6" md="4" lg="3">
      <v-card :class="{ 'opacity-50': !unlockedAt }" :disabled="!unlockedAt" hover>
        <v-card-text text-center>
          <v-avatar mb-2 :color="unlockedAt ? 'success' : 'grey'" size="64">
            <v-icon :icon="achievement.icon" size="40" color="white" />
          </v-avatar>
          <div class="text-h6" font-bold>{{ achievement.name }}</div>
          <div class="text-caption" mb-2 text-gray>{{ achievement.description }}</div>
          <v-chip mb-2 :color="getCategoryColor(achievement.category)" size="small">
            {{ achievement.category }}
          </v-chip>
          <div class="text-caption" text-yellow font-bold>{{ achievement.points }} points</div>
          <div v-if="achievement.amount && !unlockedAt" mt-2>
            <v-progress-linear :model-value="(amount / achievement.amount) * 100" :height="6" color="primary" rounded />
            <div class="text-caption" mt-1>{{ amount }} / {{ achievement.amount }}</div>
          </div>
          <div v-if="unlockedAt" class="text-caption" mt-2 text-gray>
            Unlocked {{ new Date(unlockedAt).toLocaleDateString() }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
