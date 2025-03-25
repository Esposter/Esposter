<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";

definePageMeta({ middleware: "auth" });
defineSlots<{ default: (props: Record<string, never>) => unknown }>();

const { $trpc } = useNuxtApp();
const room = await $trpc.room.readRoom.query();
if (room) await navigateTo(RoutePath.Messages(room.id), { replace: true });
else await navigateTo(RoutePath.Messages("t"), { replace: true });
</script>

<template>
  <NuxtLayout />
</template>
