<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <SurveyCrudView />
  </NuxtLayout>
</template>
