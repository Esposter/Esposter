<script setup lang="ts">
import { MESSAGES_PATH } from "@/util/constants.client";

const { $client } = useNuxtApp();
const room = await $client.room.readRoom.query();
if (room) await navigateTo(MESSAGES_PATH(room.id));
else await navigateTo(MESSAGES_PATH("t"));
</script>

<template>
  <slot />
</template>
