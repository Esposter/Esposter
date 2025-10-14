<script setup lang="ts">
import type { Webhook } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/webhook";

interface ListItemProps {
  webhook: Webhook;
}

const { webhook } = defineProps<ListItemProps>();
const webhookStore = useWebhookStore();
const { deleteWebhook, rotateToken, updateWebhook } = webhookStore;
const name = ref(webhook.name);
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-avatar color="background">
        <v-icon icon="mdi-webhook" />
      </v-avatar>
    </template>
    <v-list-item-title>
      <div flex items-center gap-2>
        <v-text-field
          v-model="name"
          label="Name"
          density="compact"
          hide-details
          @blur="updateWebhook({ id: webhook.id, name })"
        />
        <v-switch
          :model-value="webhook.isActive"
          color="primary"
          density="compact"
          hide-details
          @update:model-value="(value) => updateWebhook({ id: webhook.id, isActive: value ?? false })"
        />
      </div>
      <div text-sm text-gray>
        {{ `${useRuntimeConfig().public.baseUrl}/api/webhooks/${webhook.id}/${webhook.token}` }}
      </div>
    </v-list-item-title>
    <template #append>
      <v-btn icon="mdi-refresh" size="small" @click="rotateToken({ id: webhook.id })" />
      <StyledDeleteDialog
        :card-props="{ title: 'Delete Webhook', text: `Are you sure you want to delete ${webhook.name}?` }"
        @delete="
          async (onComplete) => {
            try {
              deleteWebhook({ id: webhook.id });
            } finally {
              onComplete();
            }
          }
        "
      >
        <template #activator="{ updateIsOpen }">
          <v-btn icon="mdi-delete" size="small" @click="updateIsOpen(true)" />
        </template>
      </StyledDeleteDialog>
    </template>
  </v-list-item>
</template>
