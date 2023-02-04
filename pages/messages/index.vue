<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const room = await $client.room.readRoom.query();
if (room) await navigateTo(MESSAGES_PATH(room.id), { replace: true });
else await navigateTo(MESSAGES_PATH("t"), { replace: true });
</script>

<template>
  <slot />
</template>
