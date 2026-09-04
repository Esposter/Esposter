<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

interface Props {
  item: ListLinkItem;
}

const { item } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <NuxtInvisibleLink
    :to="item.href"
    :external="item.external"
    :trailing-slash="item.trailingSlash"
    @click="
      async () => {
        await item.onClick?.();
        emit('select');
      }
    "
  >
    <v-list-item :value="item.title">
      <template #prepend>
        <v-avatar color="background">
          <v-icon :icon="item.icon" />
        </v-avatar>
      </template>
      <v-list-item-title font-bold>{{ item.title }}</v-list-item-title>
    </v-list-item>
  </NuxtInvisibleLink>
</template>
