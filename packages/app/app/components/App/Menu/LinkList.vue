<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

interface Props {
  items: readonly ListLinkItem[];
}

const { items } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <v-list min-width="250">
    <template v-for="item of items" :key="item.title">
      <v-list-group v-if="item.children" :value="item.title">
        <template #activator="{ props }">
          <v-list-item :="props" :value="item.title">
            <template #prepend>
              <v-avatar color="background">
                <v-icon :icon="item.icon" />
              </v-avatar>
            </template>
            <v-list-item-title font-bold>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </template>
        <AppMenuLinkListItem v-for="child of item.children" :key="child.title" :item="child" @select="emit('select')" />
      </v-list-group>
      <AppMenuLinkListItem v-else :item @select="emit('select')" />
    </template>
  </v-list>
</template>
