<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";

definePageMeta({ middleware: "auth" });

useHead({ titleTemplate: MESSAGE_DISPLAY_NAME });
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
