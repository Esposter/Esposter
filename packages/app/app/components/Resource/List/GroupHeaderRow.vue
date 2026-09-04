<script setup lang="ts">
import type { GroupHeaderSlot } from "vuetify/lib/components/VDataTable/types.mjs";

type Props = Pick<GroupHeaderSlot, "columns" | "isGroupOpen" | "item" | "toggleGroup">;

defineProps<Props>();
</script>

<template>
  <tr>
    <td :colspan="columns.length">
      <div flex gap-2 items-center>
        <v-btn size="small" variant="text" :icon="isGroupOpen(item) ? '$expand' : '$next'" @click="toggleGroup(item)" />
        <ResourceListTypeCell :type="item.value" />
        ({{ item.items.length }})
      </div>
    </td>
  </tr>
</template>
