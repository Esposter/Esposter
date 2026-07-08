<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: ["auth", "messages-client"] });

useHead({ titleTemplate: MESSAGE_DISPLAY_NAME });
const { $trpc } = useNuxtApp();
const room = await $trpc.room.readRoom.query();
if (room) await navigateTo(RoutePath.Messages(room.id), { replace: true });
</script>

<template>
  <NuxtLayout>
    <v-sheet h-full>
      <MessageLeftSideBar />
    </v-sheet>
  </NuxtLayout>
</template>
