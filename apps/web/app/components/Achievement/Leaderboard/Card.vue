<script setup lang="ts">
import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  leaderboard: PointsLeaderboard;
}

const { leaderboard } = defineProps<Props>();
const isMyEntryAppended = computed(() => {
  const { myEntry } = leaderboard;
  if (myEntry) return !leaderboard.entries.some(({ user }) => user.id === myEntry.user.id);
  else return false;
});
</script>

<template>
  <UiFrame title="Points Leaderboard">
    <p text-muted>Ranked by total unlocked achievement points</p>
    <UiEmptyState
      v-if="leaderboard.entries.length === 0"
      :meaning="UiIconMeaning.Achievement"
      title="No ranked players yet"
      description="Unlock an achievement to claim a spot on the leaderboard."
    />
    <ol v-else flex flex-col gap-1>
      <AchievementLeaderboardItem
        v-for="entry in leaderboard.entries"
        :key="entry.user.id"
        :entry
        :is-my-entry="entry.user.id === leaderboard.myEntry?.user.id || undefined"
      />
      <template v-if="isMyEntryAppended && leaderboard.myEntry">
        <li role="separator" my-1 h-1 bg-panel-edge />
        <AchievementLeaderboardItem :entry="leaderboard.myEntry" is-my-entry />
      </template>
    </ol>
  </UiFrame>
</template>
