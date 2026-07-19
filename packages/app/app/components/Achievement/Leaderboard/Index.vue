<script setup lang="ts">
// useQuery keeps the leaderboard read off the page's Suspense boundary, so a rate-limited or
// Failed read alerts and leaves the tab empty instead of erroring the whole achievements page
const { $trpc } = useNuxtApp();
const { data: leaderboard } = useQuery(() => $trpc.achievement.readPointsLeaderboard.query());
</script>

<template>
  <AchievementLeaderboardCard v-if="leaderboard" :leaderboard />
</template>
