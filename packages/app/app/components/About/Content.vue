<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { useColorsStore } from "@/store/colors";
import { SITE_NAME } from "@esposter/shared";

const colorsStore = useColorsStore();
const { primary, "primary-darken-1": primaryDarken1 } = storeToRefs(colorsStore);
</script>

<template>
  <div text-headline-large font-bold mb-8>Why {{ SITE_NAME }}?</div>
  <div text-title-large>
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
  transition: color var(--transition-duration);

  &:hover {
    color: v-bind(primaryDarken1);
  }
}
</style>
