<script setup lang="ts">
import { INDEX_PATH } from "@/util/constants";
import { gsap } from "gsap";

onMounted(() => {
  gsap.to(".hover", {
    duration: 3,
    x: gsap.utils.random(5, 10),
    y: gsap.utils.random(10, 100),
    rotation: gsap.utils.random(-20, 20),
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
});
</script>

<template>
  <NuxtLayout>
    <div class="image" position="relative" h="full" display="flex" flex="col" justify="center" items="center">
      <div position="relative" mt="25" display="flex" flex="col" items="center" z="1">
        <div class="text" text="center 5xl">Lost in space?</div>
        <InvisibleNuxtLink pt="4" :to="INDEX_PATH">
          <v-btn class="button">Go back home</v-btn>
        </InvisibleNuxtLink>
      </div>
      <div class="hover" position="relative" mt="-25">
        <VisualFloatingAstronaut />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.text {
  color: #ddd;
}
.button {
  color: #fff;
  background-image: $vueGradient;
}

.image {
  background-image: url("/img/404bg.svg");
  background-color: #000;
  background-position: center;
  background-size: cover;
}
</style>
