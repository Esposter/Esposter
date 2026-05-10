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
    relative
    h-full
    flex
    flex-col
    items-center
    justify-center
    bg="center cover black"
  >
    <slot />
    <div class="hover" absolute right-18 top-8>
      <VisualFloatingAstronaut />
    </div>
  </div>
</template>
