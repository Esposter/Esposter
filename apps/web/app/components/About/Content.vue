<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";
</script>

<!-- The gem stands beside the one line on why, a mark for the thing being said, so it costs no row of its own -->
<template>
  <section flex flex-wrap gap-4 items-center justify-center>
    <VisualGem size-32 />
    <div flex flex-col gap-2 max-w-prose>
      <h2 ui-title>Why {{ SITE_NAME }}?</h2>
      <p ui-lede>
        A minimal, lean place to do and create whatever you want, made by
        <NuxtLink text-info no-underline hover:underline target="_blank" :to="LINKEDIN_PROFILE_URL">Jimmy Chen</NuxtLink
        >.
      </p>
    </div>
  </section>
</template>
