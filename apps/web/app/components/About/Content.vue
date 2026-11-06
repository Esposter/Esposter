<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";
</script>

<template>
  <section flex flex-col gap-4 max-w-prose>
    <h2 ui-title>Why {{ SITE_NAME }}?</h2>
    <p>
      One person's attempt to keep the best parts of social media and leave out the rest. Made, and still being made, by
      <NuxtLink text-info no-underline hover:underline target="_blank" :to="LINKEDIN_PROFILE_URL">Jimmy Chen</NuxtLink>.
    </p>
  </section>
</template>
