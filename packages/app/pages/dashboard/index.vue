<script setup lang="ts">
defineRouteRules({ ssr: false });

await useReadDashboard();
</script>

<template>
  <NuxtLayout>
    <Dashboard />
  </NuxtLayout>
</template>
