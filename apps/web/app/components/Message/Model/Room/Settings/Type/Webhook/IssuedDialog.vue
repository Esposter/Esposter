<script setup lang="ts">
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";

const webhookDialogStore = useWebhookDialogStore();
const { issuedUrl } = storeToRefs(webhookDialogStore);
// Open while a URL is held, and closing it lets the URL go, since the server never answers it again
const isOpen = computed({
  get: () => issuedUrl.value !== "",
  set: (newIsOpen) => {
    if (!newIsOpen) issuedUrl.value = "";
  },
});
</script>

<template>
  <UiDialog v-model="isOpen" title="Webhook URL">
    <p>Copy this URL now. It won't be shown again, so if it is lost, regenerate the URL for a new one.</p>
    <div flex gap-2 items-center>
      <p flex-1 min-w-0 break-all>{{ issuedUrl }}</p>
      <UiCopyButton :source="issuedUrl" label="Copy URL" />
    </div>
  </UiDialog>
</template>
