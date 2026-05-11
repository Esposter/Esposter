<script setup lang="ts">
import { LINKEDIN_PROFILE_URL } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";
</script>

<template>
  <div font-bold mb-8 text-headline-large>Why {{ SITE_NAME }}?</div>
  <div text-title-large>
    {{ SITE_NAME }} is an independent, community-driven lifetime project. It was created by
    <NuxtInvisibleLink
      hover:text-primary-darken-1
      font-bold
      transition-colors
      duration-[--transition-duration]
      text-primary
      target="_blank"
      :to="LINKEDIN_PROFILE_URL"
    >
      Jimmy Chen
    </NuxtInvisibleLink>
    as a personal attempt to incorporate the best features of social media in a minimalistic way with the least amount
    of code.
  </div>
</template>
