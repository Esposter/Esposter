<script setup lang="ts">
import { SITE_DESCRIPTION } from "#shared/services/app/constants";
import { SITE_NAME } from "@esposter/shared";
</script>

<template>
  <header text-center flex flex-col gap-2 items-center>
    <AppLogo width="14rem" />
    <h1 ui-display>{{ SITE_NAME }}</h1>
    <p max-w-prose ui-lede>{{ SITE_DESCRIPTION }}</p>
    <p text-muted max-w-prose>/ɛsˈpɒstər/ — "ess-POS-ter", the last two syllables as in "imposter"</p>
  </header>
</template>
