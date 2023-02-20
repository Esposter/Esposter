<script setup lang="ts">
import type { ListItem } from "@/models/esposter";
import { RoutePath } from "@/models/router";

const items: ListItem[] = [
  {
    title: "Esbabbler",
    href: RoutePath.MessagesIndex,
    icon: "mdi-message-fast",
  },
  {
    title: `${ITEM_NAME} Clicker`,
    href: RoutePath.Clicker,
    icon: "mdi-fruit-pineapple",
  },
];
</script>

<template>
  <v-list>
    <NuxtInvisibleLink v-for="item in items" :key="item.title" :to="item.href">
      <v-list-item :value="item.title">
        <template #prepend>
          <v-avatar color="background">
            <v-icon :icon="item.icon" />
          </v-avatar>
        </template>
        <v-list-item-title font="bold!">{{ item.title }}</v-list-item-title>
      </v-list-item>
    </NuxtInvisibleLink>
  </v-list>
</template>
