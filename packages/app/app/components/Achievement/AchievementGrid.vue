<script setup lang="ts">
import type { Achievement, UserAchievement } from "@esposter/db-schema";

import { AchievementCategory } from "@esposter/db-schema";

interface AchievementGridProps {
  achievements: (UserAchievement & { achievement: Achievement })[];
}

const { achievements } = defineProps<AchievementGridProps>();
const getCategoryColor = (category: AchievementCategory) => {
  switch (category) {
    case AchievementCategory.Messaging:
      return "blue";
    case AchievementCategory.Milestone:
      return "orange";
    case AchievementCategory.Social:
      return "purple";
    case AchievementCategory.Special:
      return "pink";
    default:
      return "grey";
  }
};
</script>

<template>
  <v-row>
    <v-col v-for="item in achievements" :key="item.id" cols="12" sm="6" md="4" lg="3">
      <v-card :disabled="!item.unlockedAt" :class="{ 'opacity-50': !item.unlockedAt }" hover>
        <v-card-text text-center>
          <v-avatar :color="item.unlockedAt ? 'success' : 'grey'" size="64" mb-2>
            <v-icon :icon="item.achievement.icon" size="40" color="white" />
          </v-avatar>
          <div text-h6 font-bold>{{ item.achievement.name }}</div>
          <div text-caption text-gray mb-2>{{ item.achievement.description }}</div>
          <v-chip :color="getCategoryColor(item.achievement.category)" size="small" mb-2>
            {{ item.achievement.category }}
          </v-chip>
          <div text-caption font-bold text-amber>{{ item.achievement.points }} points</div>
          <div v-if="item.achievement.targetProgress && !item.unlockedAt" mt-2>
            <v-progress-linear
              :model-value="((item.points || 0) / item.achievement.targetProgress) * 100"
              :height="6"
              color="primary"
              rounded
            />
            <div text-caption mt-1>{{ item.points || 0 }} / {{ item.achievement.targetProgress }}</div>
          </div>
          <div v-if="item.unlockedAt" text-caption text-gray mt-2>
            Unlocked {{ new Date(item.unlockedAt).toLocaleDateString() }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
