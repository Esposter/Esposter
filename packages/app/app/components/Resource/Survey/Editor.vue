<script setup lang="ts">
const { creator } = useSurveyCreator();
</script>

<template>
  <StyledSkeleton v-if="!creator" />
  <SurveyCreatorComponent v-else :model="creator" />
</template>

<style scoped>
:deep(.svc-creator__banner) {
  display: none !important;
}
</style>
