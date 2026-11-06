<script setup lang="ts">
import vuejsLogoUwuUrl from "@/assets/about/vuejsLogoUWU.png?url";
</script>

<!-- The credit just under the name, large enough to be the page's second hero. The picture's size is given, so the
     places below do not move when it loads -->
<template>
  <section text-center flex flex-col gap-2 w-full items-center>
    <h2 max-w-prose ui-title>An approachable, performant and versatile javascript application powered by</h2>
    <NuxtImg max-w-240 w-full :height="631" :src="vuejsLogoUwuUrl" :width="1309" alt="Vue.js" />
  </section>
</template>
