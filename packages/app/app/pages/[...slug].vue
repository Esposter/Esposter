<script setup lang="ts">
import { RoutePath } from "@esposter/shared";
import { gsap } from "gsap";

const event = useRequestEvent();
if (event) setResponseStatus(event, 404);

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
  <NuxtLayout>
    <VisualSpaceBackground>
      <div flex flex-col items-center>
        <div class="v-theme--light text-background" text-5xl text-center>Lost in space?</div>
        <NuxtInvisibleLink pt-4 :to="RoutePath.Index">
          <StyledButton :button-props="{ text: 'Go back home' }" />
        </NuxtInvisibleLink>
      </div>
    </VisualSpaceBackground>
  </NuxtLayout>
</template>
