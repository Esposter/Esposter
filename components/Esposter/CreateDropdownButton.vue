<script setup lang="ts">
import { mergeProps } from "vue";
import { POST_CREATE_PATH } from "@/util/constants";

interface Item {
  title: string;
  href: string;
  icon: string;
}

const items: Item[] = [
  {
    title: "Create Post",
    href: POST_CREATE_PATH,
    icon: "mdi-pencil",
  },
];
</script>

<template>
  <v-menu location="bottom start">
    <template #activator="{ props: menuProps }">
      <!-- @NOTE: <v-tooltip location="bottom" text="More">
          <template #activator="{ props: tooltipProps }"> -->
      <v-avatar color="background">
        <v-btn icon="mdi-plus" :="mergeProps(menuProps)" />
      </v-avatar>
      <!-- </template>
        </v-tooltip> -->
    </template>
    <v-list min-width="250">
      <InvisibleNuxtLink v-for="item in items" :key="item.title" :to="item.href">
        <v-list-item :value="item.title">
          <template #prepend>
            <v-avatar color="background">
              <v-icon :icon="item.icon" />
            </v-avatar>
          </template>
          <v-list-item-title font="bold!">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </InvisibleNuxtLink>
    </v-list>
  </v-menu>
</template>
