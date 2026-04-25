<script setup lang="ts">
import { ProductListLinkItems } from "@/services/app/ProductListLinkItems";
</script>

<template>
  <v-list>
    <NuxtInvisibleLink v-for="{ title, icon, href } of ProductListLinkItems" :key="title" :to="href">
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
