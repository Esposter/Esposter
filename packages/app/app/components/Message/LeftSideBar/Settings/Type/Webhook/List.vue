<script setup lang="ts">
import { useWebhookStore } from "@/store/message/webhook";

const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
</script>

<template>
  <v-list>
    <v-list-subheader>Webhooks</v-list-subheader>
    <MessageLeftSideBarSettingsTypeWebhookNoData v-if="items.length === 0" />
    <template v-else>
      <MessageLeftSideBarSettingsTypeWebhookListItem v-for="webhook of items" :key="webhook.id" :webhook />
    </template>
  </v-list>
</template>
