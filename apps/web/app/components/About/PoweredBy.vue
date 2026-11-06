<script setup lang="ts">
import vuejsLogoUwuUrl from "@/assets/about/vuejsLogoUWU.png?url";
</script>

<!-- The credit just under the name, the one line that says what the site stands on, with the logo large enough to be
     the page's second hero -->
<template>
  <section text-center flex flex-col gap-2 items-center w-full>
    <h2 ui-title max-w-prose>An approachable, performant and versatile javascript application powered by</h2>
    <NuxtImg max-w-240 w-full :src="vuejsLogoUwuUrl" alt="Vue.js" />
  </section>
</template>
