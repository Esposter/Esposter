<script setup lang="ts">
import { useScrollToMessage } from "@/composables/esbabbler/useScrollToMessage";
import { validate } from "@/services/router/validate";

definePageMeta({ middleware: "auth", validate });

const route = useRoute();
const rowKey = route.params.rowKey as string;

if (rowKey) {
  const scrollToMessage = useScrollToMessage();

  onMounted(() => {
    scrollToMessage(rowKey);
  });
}
</script>

<template>
  <NuxtLayout name="messages" />
</template>
