<script setup lang="ts">
import { RoutePath } from "@esposter/shared";

const event = useRequestEvent();
if (event) setResponseStatus(event, 404);
</script>

<template>
  <NuxtLayout>
    <VisualSpaceBackground>
      <div flex flex-col gap-y-4 items-center>
        <div text-5xl text-center>Lost in space?</div>
        <NuxtInvisibleLink :to="RoutePath.Index">
          <StyledButton :button-props="{ text: 'Go back home' }" />
        </NuxtInvisibleLink>
      </div>
    </VisualSpaceBackground>
  </NuxtLayout>
</template>
