<script setup lang="ts">
import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";

interface Props {
  leaderboard: PointsLeaderboard;
}

const { leaderboard } = defineProps<Props>();
const isMyEntryAppended = computed(
  () =>
    leaderboard.myEntry !== undefined &&
    !leaderboard.entries.some(({ user }) => user.id === leaderboard.myEntry?.user.id),
);
</script>

<template>
  <StyledCard>
    <v-card-title flex gap-x-2 items-center>
      <v-icon icon="mdi-podium" />
      Points Leaderboard
    </v-card-title>
    <v-card-subtitle>Ranked by total unlocked achievement points</v-card-subtitle>
    <v-card-text>
      <StyledEmptyState
        v-if="leaderboard.entries.length === 0"
        icon="mdi-trophy-outline"
        title="No ranked players yet"
        description="Unlock an achievement to claim a spot on the leaderboard."
      />
      <div v-else flex flex-col gap-y-1>
        <AchievementLeaderboardItem
          v-for="entry in leaderboard.entries"
          :key="entry.user.id"
          :entry
          :is-my-entry="entry.user.id === leaderboard.myEntry?.user.id || undefined"
        />
        <template v-if="isMyEntryAppended && leaderboard.myEntry">
          <v-divider my-1 />
          <AchievementLeaderboardItem :entry="leaderboard.myEntry" is-my-entry />
        </template>
      </div>
    </v-card-text>
  </StyledCard>
</template>
