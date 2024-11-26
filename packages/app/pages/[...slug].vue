<script setup lang="ts">
import { NOT_FOUND_BACKGROUND_PATH } from "@/services/esposter/constants";
import { RoutePath } from "@/shared/models/router/RoutePath";
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
    <div
      :style="{ backgroundImage: `url(${NOT_FOUND_BACKGROUND_PATH})` }"
      h-full
      flex
      justify-center
      items-center
      flex-col
      bg="center cover black"
    >
      <div flex flex-col items-center z-1 mt-25>
        <div text="#ddd" text-center text-5xl>Lost in space?</div>
        <NuxtInvisibleLink pt-4 :to="RoutePath.Index">
          <StyledButton>Go back home</StyledButton>
        </NuxtInvisibleLink>
      </div>
      <div class="hover" mt--25>
        <VisualFloatingAstronaut />
      </div>
    </div>
  </NuxtLayout>
</template>
