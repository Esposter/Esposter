<script setup lang="ts">
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { validate } from "@/services/router/validate";
import { useThreadStore } from "@/store/message/thread";
import { requireRouteParam } from "@/util/router/requireRouteParam";

definePageMeta({ middleware: "auth", validate });

const { currentRoute } = useRouter();
const threadStore = useThreadStore();
const { openThread } = threadStore;
const roomId = requireRouteParam(currentRoute.value.params, "id");
const rowKey = requireRouteParam(currentRoute.value.params, "rowKey");
// The same room the message route renders, with the pane opened on the thread the url names — which is what
// Makes a thread linkable at all: a popped-out thread window, and every link into one, land here.
// On mounted rather than in setup: the layout is this page's own child, so its mount decides the drawer state
// For the breakpoint first, and an open issued before that would be closed again on a phone
onMounted(getSynchronizedFunction(() => openThread(roomId, rowKey)));
</script>

<template>
  <NuxtLayout name="messages" />
</template>
