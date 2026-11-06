<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";
</script>

<!-- The line on why and the gem sit close as one centred unit, the gem on the right so the pair reads as centred, and
     the gem costs no row of its own -->
<template>
  <section flex flex-wrap gap-2 w-full items-center justify-center>
    <div text-center flex flex-col gap-2 max-w-prose items-center>
      <h2 ui-title>Why {{ SITE_NAME }}?</h2>
      <p text-balance ui-lede>
        A fun place to do and create whatever you want. Built on a unified, next-generation toolchain, so it stays
        minimal, intuitive and fast without the extra weight.
      </p>
      <p text-muted>
        Made by
        <NuxtLink text-info no-underline hover:underline target="_blank" :to="LINKEDIN_PROFILE_URL"
          >Jimmy Chen</NuxtLink
        >
      </p>
    </div>
    <VisualGem size-32 />
  </section>
</template>
