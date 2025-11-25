<script setup lang="ts">
const achievementStore = useAchievementStore();
const { lockedAchievements, stats, unlockedAchievements, userAchievements } = storeToRefs(achievementStore);
const tab = ref("all");
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
        mb-4
        :height="8"
        color="primary"
        rounded
      />
      <v-tabs v-model="tab" mb-4>
        <v-tab value="all">All</v-tab>
        <v-tab value="unlocked">Unlocked</v-tab>
        <v-tab value="locked">Locked</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="all">
          <AchievementGrid :achievements="userAchievements" />
        </v-window-item>
        <v-window-item value="unlocked">
          <AchievementGrid :achievements="unlockedAchievements" />
        </v-window-item>
        <v-window-item value="locked">
          <AchievementGrid :achievements="lockedAchievements" />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>
