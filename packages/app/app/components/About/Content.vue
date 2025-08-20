<script setup lang="ts">
import { LINKEDIN_PROFILE_URL, SITE_NAME } from "#shared/services/app/constants";

const { primary, "primary-darken-1": primaryDarken1 } = useColors();
</script>

<template>
  <div class="text-h4" font-bold mb-8>Why {{ SITE_NAME }}?</div>
  <div class="text-h6">
    {{ SITE_NAME }} is an independent, community-driven lifetime project. It was created by
    <NuxtInvisibleLink class="author" font-bold target="_blank" :to="LINKEDIN_PROFILE_URL">
      Jimmy Chen
    </NuxtInvisibleLink>
    as a personal attempt to incorporate the best features of social media in a minimalistic way with the least amount
    of code.
  </div>
</template>

<style scoped lang="scss">
.author {
  color: v-bind(primary);
  transition: color $transition-duration-root;

  &:hover {
    color: v-bind(primaryDarken1);
  }
}
</style>
