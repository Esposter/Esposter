<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";
</script>

<template>
  <section text-center flex flex-col gap-2 max-w-prose>
    <h2 ui-title>Why {{ SITE_NAME }}?</h2>
    <p ui-lede>
      A minimal, lean place to do and create whatever you want, made by
      <NuxtLink text-info no-underline hover:underline target="_blank" :to="LINKEDIN_PROFILE_URL">Jimmy Chen</NuxtLink>.
    </p>
  </section>
</template>
