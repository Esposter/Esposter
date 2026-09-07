<script setup lang="ts">
// Keep the leaderboard read off the page's Suspense boundary via useQuery, so a rate-limited or
// Failed read alerts and leaves the tab empty instead of erroring the whole achievements page
const { $trpc } = useNuxtApp();
const { data: leaderboard } = useQuery(() => $trpc.achievement.readPointsLeaderboard.query());
</script>

<template>
  <AchievementLeaderboardCard v-if="leaderboard" :leaderboard />
</template>
