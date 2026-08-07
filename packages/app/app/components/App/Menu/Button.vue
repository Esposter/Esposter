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
    <AppMenuLinkList :items @select="menu = false" />
  </v-menu>
</template>
