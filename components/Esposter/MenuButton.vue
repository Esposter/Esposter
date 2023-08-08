<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import type { ListItem } from "@/models/shared/ListItem";
import { ITEM_NAME } from "@/services/clicker/constants";
import { mergeProps } from "vue";

const items: ListItem[] = [
  {
    title: "Create Post",
    href: RoutePath.PostCreate,
    icon: "mdi-square-edit-outline",
  },
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
  {
    title: "Table Editor",
    href: RoutePath.TableEditor,
    icon: "mdi-table-edit",
  },
  {
    title: "Surveyer",
    href: RoutePath.Surveyer,
    icon: "mdi-text-box-edit",
  },
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
      <NuxtInvisibleLink v-for="item in items" :key="item.title" :to="item.href" @click="menu = false">
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
  </v-menu>
</template>
