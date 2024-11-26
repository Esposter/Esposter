<script setup lang="ts">
import type { ListItem } from "@/models/shared/ListItem";

import { productListItems } from "@/services/esposter/productListItems";
import { RoutePath } from "@/shared/models/router/RoutePath";
import { mergeProps } from "vue";

const items: ListItem[] = [
  {
    href: RoutePath.PostCreate,
    icon: "mdi-square-edit-outline",
    title: "Create Post",
  },
  ...productListItems,
];
const menu = ref(false);
</script>

<template>
  <v-menu v-model="menu" location="bottom start" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom" text="Menu">
        <template #activator="{ props: tooltipProps }">
          <v-avatar color="background">
            <v-btn icon="mdi-dots-grid" :="mergeProps(menuProps, tooltipProps)" />
          </v-avatar>
        </template>
      </v-tooltip>
    </template>
    <v-list min-width="250">
      <NuxtInvisibleLink v-for="item of items" :key="item.title" :to="item.href" @click="menu = false">
        <v-list-item :value="item.title">
          <template #prepend>
            <v-avatar color="background">
              <v-icon :icon="item.icon" />
            </v-avatar>
          </template>
          <v-list-item-title font-bold="!">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </NuxtInvisibleLink>
    </v-list>
  </v-menu>
</template>
