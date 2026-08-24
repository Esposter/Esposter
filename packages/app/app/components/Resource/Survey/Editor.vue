<script setup lang="ts">
const { creator } = useSurveyCreator();
</script>

<template>
  <StyledSkeleton v-if="!creator" />
  <SurveyCreatorComponent v-else :model="creator" />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -- SurveyCreatorComponent renders a Fragment, and Vue passes the scope id onto a child's root element only when it has exactly one — so `scoped` matches nothing here and `:deep()` has no ancestor to anchor to -->
<style>
.svc-creator__banner {
  display: none;
}
</style>
