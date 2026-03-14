<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";

const { primary, "primary-darken-1": primaryDarken1 } = useColors();
</script>

<template>
  <div class="text-headline-large" font-bold mb-8>Why {{ SITE_NAME }}?</div>
  <div class="text-title-large">
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
