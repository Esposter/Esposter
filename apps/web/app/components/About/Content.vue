<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";
</script>

<template>
  <section flex flex-col gap-4 max-w-prose>
    <h2 ui-title>Why {{ SITE_NAME }}?</h2>
    <p>
      {{ SITE_NAME }} is an independent, community-driven lifetime project. It was created by
      <NuxtLink text-accent underline target="_blank" :to="LINKEDIN_PROFILE_URL"> Jimmy Chen </NuxtLink>
      as a personal attempt to incorporate the best features of social media in a minimalistic way with the least amount
      of code.
    </p>
  </section>
</template>
