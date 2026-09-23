<script setup lang="ts">
import { VUEJS_LOGO_UWU_PATH } from "#shared/services/app/constants";
</script>

<template>
  <header text-center flex flex-col gap-4 items-center>
    <VisualGem />
    <!-- The one word the line is about takes the accent a heading is drawn in, and the rest reads as body text -->
    <h1 ui-display>
      <span text-text>The</span> Progressive
      <br />
      <span text-text>JavaScript Application</span>
    </h1>
    <p text-muted max-w-prose>An approachable, performant and versatile javascript application powered by</p>
    <NuxtImg max-w-180 w-full :src="VUEJS_LOGO_UWU_PATH" alt="uwu" />
  </header>
</template>
