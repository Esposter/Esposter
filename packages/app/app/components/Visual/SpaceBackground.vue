<script setup lang="ts">
import { NOT_FOUND_BACKGROUND_PATH } from "#shared/services/app/constants";
import { gsap } from "gsap";

defineSlots<{ default: () => VNode }>();

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
    flex
    flex-col
    h-full
    items-center
    justify-center
    relative
    bg="center cover black"
  >
    <slot />
    <div class="hover" right-18 top-8 absolute>
      <VisualFloatingAstronaut />
    </div>
  </div>
</template>
