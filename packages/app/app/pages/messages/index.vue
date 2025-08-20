<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";

definePageMeta({ middleware: "auth" });

useHead({ titleTemplate: "Esbabbler" });
const { $trpc } = useNuxtApp();
const room = await $trpc.room.readRoom.query();
if (room) await navigateTo(RoutePath.Messages(room.id), { replace: true });
</script>

<template>
  <NuxtLayout>
    <template #default>
      <div class="bg-surface" h-full>
        <MessageLeftSideBar />
      </div>
    </template>
  </NuxtLayout>
</template>
