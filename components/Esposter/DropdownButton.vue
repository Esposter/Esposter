<script setup lang="ts">
import { ABOUT_PATH } from "@/util/constants";

const items = [
  {
    title: "About",
    href: ABOUT_PATH,
    icon: "mdi-information-outline",
  },
];
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn icon="mdi-dots-vertical" :="props" />
    </template>
    <v-card min-width="300">
      <v-list>
        <v-list-item v-for="item in items" :key="item.href" :value="item.href" @click="navigateTo(item.href)">
          <v-list-item-avatar start>
            <v-icon :icon="item.icon" />
          </v-list-item-avatar>
          <v-list-item-title font="bold!">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
