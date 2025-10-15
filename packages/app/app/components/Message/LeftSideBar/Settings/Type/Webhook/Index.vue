<script setup lang="ts">
import { useWebhookStore } from "@/store/message/webhook";

const webhookStore = useWebhookStore();
const { createWebhook, readWebhooks } = webhookStore;
await readWebhooks();
const name = ref("");
const isLoading = ref(false);
</script>

<template>
  <div flex flex-col gap-y-4>
    <div flex justify-center items-center gap-x-4>
      <v-text-field v-model="name" :disabled="isLoading" label="Name" density="compact" hide-details />
      <StyledButton
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
      </StyledButton>
    </div>
    <MessageLeftSideBarSettingsTypeWebhookList />
  </div>
</template>
