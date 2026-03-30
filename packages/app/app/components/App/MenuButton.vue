<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { ProductListLinkItems } from "@/services/app/ProductListLinkItems";
import { RoutePath } from "@esposter/shared";
import { mergeProps } from "vue";

const items: ListLinkItem[] = [
  {
    href: RoutePath.PostCreate,
    icon: "mdi-square-edit-outline",
    title: "Create Post",
  },
  ...ProductListLinkItems,
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
      <NuxtInvisibleLink v-for="{ title, href, icon } of items" :key="title" :to="href" @click="menu = false">
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
  </v-menu>
</template>
