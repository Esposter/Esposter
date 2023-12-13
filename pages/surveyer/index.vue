<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <SurveyerCrudView />
  </NuxtLayout>
</template>
