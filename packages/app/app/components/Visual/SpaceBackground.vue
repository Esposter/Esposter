<script setup lang="ts">
import { NOT_FOUND_BACKGROUND_PATH } from "#shared/services/esposter/constants";
import { gsap } from "gsap";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();

onMounted(() => {
  gsap.to(".hover", {
    duration: 3,
    ease: "sine.inOut",
    repeat: -1,
    rotation: gsap.utils.random(-20, 20),
    x: gsap.utils.random(5, 10),
    y: gsap.utils.random(10, 100),
    yoyo: true,
  });
});
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${NOT_FOUND_BACKGROUND_PATH})` }"
    h-full
    flex
    justify-center
    items-center
    flex-col
    relative
    bg="center cover black"
  >
    <slot />
    <div class="hover" absolute top-8 right-18>
      <VisualFloatingAstronaut />
    </div>
  </div>
</template>
