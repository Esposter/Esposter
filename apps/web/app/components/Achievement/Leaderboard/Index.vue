<script setup lang="ts">
// Keep the leaderboard read off the page's Suspense boundary via useQuery, so a rate-limited or failed read fails
// Inside the tab, with its retry, instead of erroring the whole achievements page
const { $trpc } = useNuxtApp();
const {
  data: leaderboard,
  error,
  refresh,
} = useQuery(() => $trpc.achievement.readPointsLeaderboard.query(), { isInlineError: true });
</script>

<template>
  <UiAsyncBody :error :is-pending="leaderboard ? undefined : true" @retry="refresh()">
    <!-- Ranked players' own rows while the read is out -->
    <template #loading>
      <div aria-busy="true" flex flex-col>
        <UiListRowSkeleton v-for="index of 5" :key="index" is-text-short />
      </div>
    </template>
    <AchievementLeaderboardCard v-if="leaderboard" :leaderboard />
  </UiAsyncBody>
</template>
