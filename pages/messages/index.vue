<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";

definePageMeta({ middleware: "auth" });
defineSlots<{ default: (props: {}) => unknown }>();

const { $client } = useNuxtApp();
const room = await $client.room.readRoom.query();
if (room) await navigateTo(RoutePath.Messages(room.id), { replace: true });
else await navigateTo(RoutePath.Messages("t"), { replace: true });
</script>

<template>
  <NuxtLayout />
</template>
