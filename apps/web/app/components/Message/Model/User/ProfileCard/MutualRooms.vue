<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface Props {
  mutualRooms: Pick<RoomInMessage, "id" | "image" | "name">[];
}

const { mutualRooms } = defineProps<Props>();
const items = computed(() =>
  mutualRooms.map(({ id, image, name }) => ({
    image: image ?? "",
    title: name ?? "",
    to: RoutePath.Messages(id),
    value: id,
  })),
);
</script>

<template>
  <section flex flex-col gap-1>
    <h3 text-sm text-muted>Mutual rooms</h3>
    <UiList :items label="Mutual rooms" />
  </section>
</template>
