<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface Props {
  // The read's failure, drawn as the section's own error state with a retry
  error: string;
  // Undefined while the read is out, so the section holds its place in skeleton rows until it settles
  mutualRooms?: Pick<RoomInMessage, "id" | "image" | "name">[] | undefined;
}

const { mutualRooms } = defineProps<Props>();
const emit = defineEmits<{ retry: [] }>();
const items = computed(() =>
  (mutualRooms ?? []).map(({ id, image, name }) => ({ image, title: name, to: RoutePath.Messages(id), value: id })),
);
</script>

<template>
  <section flex flex-col gap-1>
    <h3 text-muted ui-title>Mutual rooms</h3>
    <UiErrorState v-if="error" :error @retry="emit('retry')" />
    <ul v-else-if="!mutualRooms" aria-busy="true" flex flex-col>
      <li v-for="index of 3" :key="index">
        <UiListRowSkeleton />
      </li>
    </ul>
    <UiList v-else :items label="Mutual rooms" />
  </section>
</template>
