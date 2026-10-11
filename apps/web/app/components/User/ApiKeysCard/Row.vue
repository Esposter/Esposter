<script setup lang="ts">
import type { McpScope } from "#shared/models/auth/McpScope";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { McpScopeTitleMap } from "@/services/auth/McpScopeTitleMap";

interface Props {
  createdAt: Date;
  // What the key reaches; a key holding none reaches no tool
  mcpScopes: McpScope[];
  name: string;
  // The key's first characters, which is all of it the server keeps readable, so the owner can match a row to the
  // Key an agent holds
  start: string;
}

const { createdAt, mcpScopes, name, start } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const description = computed(() =>
  [
    start ? `${start}…` : "",
    mcpScopes.length > 0 ? mcpScopes.map((mcpScope) => McpScopeTitleMap[mcpScope]).join(", ") : "No scopes",
  ]
    .filter(Boolean)
    .join(" · "),
);
</script>

<template>
  <li ui-row>
    <UiItemContent :description :meaning="UiIconMeaning.Terminal" :title="name">
      <template #append>
        <NuxtTime :datetime="createdAt" text-sm text-muted text-nowrap relative />
        <UiButton @click="emit('delete')">Delete</UiButton>
      </template>
    </UiItemContent>
  </li>
</template>
