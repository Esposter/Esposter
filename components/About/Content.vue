<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "@/util/constants.client";

const { primary, "primary-darken-1": primaryDarken1 } = useColors();
</script>

<template>
  <div>
    <div class="text-h4" mb="8" font="bold">Why Esposter?</div>
    <div class="text-h6">
      Esposter is an independent, community-driven lifetime project. It was created by
      <InvisibleNuxtLink class="author" font="bold" target="_blank" :to="LINKEDIN_PROFILE_URL">
        Jimmy Chen
      </InvisibleNuxtLink>
      as a personal attempt to incorporate the best features of social media in a minimalistic way with the least amount
      of code.
    </div>
  </div>
</template>

<style scoped lang="scss">
.author {
  color: v-bind(primary);
  transition: color 0.25s;

  &:hover {
    color: v-bind(primaryDarken1);
  }
}
</style>
