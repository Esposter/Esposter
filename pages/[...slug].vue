<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { NOT_FOUND_BACKGROUND } from "@/services/esposter/constants";
import { gsap } from "gsap";

const event = useRequestEvent();

setResponseStatus(event, 404);

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
    <div
      :style="{ backgroundImage: `url(${NOT_FOUND_BACKGROUND})` }"
      h-full
      flex
      flex-col
      justify-center
      items-center
      bg="#000"
      bg-center
      bg-cover
    >
      <div mt-25 flex flex-col items-center z-1>
        <div class="text-#ddd" text-center text-5xl>Lost in space?</div>
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
