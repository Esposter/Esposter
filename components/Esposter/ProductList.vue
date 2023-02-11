<script setup lang="ts">
import { RoutePath } from "@/models/router";

interface Item {
  title: string;
  href: string;
  icon: string;
}

const items: Item[] = [
  {
    title: "Esbabbler",
    href: RoutePath.MessagesIndex,
    icon: "mdi-message-fast",
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
