<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

interface AppMenuLinkListProps {
  items: ListLinkItem[];
}

const { items } = defineProps<AppMenuLinkListProps>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <v-list min-width="250">
    <NuxtInvisibleLink
      v-for="{ icon, title, href, onClick, ...rest } of items"
      :key="title"
      :to="href"
      :="rest"
      @click="
        async () => {
          await onClick?.();
          emit('select');
        }
      "
    >
      <v-list-item :value="title">
        <template #prepend>
          <v-avatar color="background">
            <v-icon :icon />
          </v-avatar>
        </template>
        <v-list-item-title font-bold>{{ title }}</v-list-item-title>
      </v-list-item>
    </NuxtInvisibleLink>
  </v-list>
</template>
