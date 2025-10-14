<script setup lang="ts">
import { useWebhookStore } from "@/store/message/webhook";

const webhookStore = useWebhookStore();
const { createWebhook, readWebhooks } = webhookStore;
await readWebhooks();
const name = ref("");
const isLoading = ref(false);
</script>

<template>
  <div flex flex-col gap-4>
    <div flex items-end gap-2>
      <v-text-field v-model="name" label="Name" density="compact" :disabled="isLoading" />
      <v-btn
        color="primary"
        :loading="isLoading"
        :disabled="!name"
        @click="
          async () => {
            isLoading = true;
            await createWebhook({ name });
            isLoading = false;
          }
        "
      >
        Create
      </v-btn>
    </div>
    <MessageLeftSideBarSettingsTypeWebhookList />
  </div>
</template>
