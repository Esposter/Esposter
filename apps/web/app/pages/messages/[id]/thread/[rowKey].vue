<script setup lang="ts">
import { checkIsMessageRoute } from "@/services/router/checkIsMessageRoute";
import { getSynchronizedFunction } from "@esposter/shared";

definePageMeta({ middleware: "auth", validate: checkIsMessageRoute });

const route = useRoute();
const openThread = useOpenThread();
const { id: roomId, rowKey } = route.params;
// The same room the message route renders, with the pane opened on the thread the url names — which is what
// Makes a thread linkable at all: a popped-out thread window, and every link into one, land here.
// On mounted rather than in setup: the layout is this page's own child, so its mount decides the drawer state
// For the breakpoint first, and an open issued before that would be closed again on a phone
const openRouteThread = getSynchronizedFunction(() => openThread(roomId, rowKey));

onMounted(() => {
  openRouteThread();
});
</script>

<template>
  <NuxtLayout name="messages" />
</template>
