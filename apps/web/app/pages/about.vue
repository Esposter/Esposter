<script setup lang="ts">
import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";

// The globe is the last thing on the page and three.js is most of its weight, so its code is fetched only once the
// Reader scrolls within a screen of it. The box holds the globe's size meanwhile, so nothing shifts when it arrives
const globeContainer = useTemplateRef("globeContainer");
const isGlobeNear = ref(false);
const { stop } = useIntersectionObserver(
  globeContainer,
  (entries) => {
    if (!entries.some(({ isIntersecting }) => isIntersecting)) return;
    isGlobeNear.value = true;
    stop();
  },
  { rootMargin: GlobeConfiguration.loadMargin },
);
</script>

<template>
  <NuxtLayout>
    <article px-4 py-6 flex flex-col gap-6 items-center ui-body>
      <AboutHeader />
      <AboutPoweredBy />
      <AboutProducts />
      <AboutContent />
      <AboutSupporters />
      <section flex flex-col gap-4 items-center>
        <h2 text-center ui-title>Here's a globe for you to play around with if you are bored 🙂</h2>
        <div ref="globeContainer" max-w-180 w-full aspect-square>
          <LazyVisualGlobe v-if="isGlobeNear" />
        </div>
      </section>
    </article>
  </NuxtLayout>
</template>
