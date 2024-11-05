<script setup lang="ts">
import { productListItems } from "@/services/esposter/productListItems";
</script>

<template>
  <v-list>
    <NuxtInvisibleLink v-for="item of productListItems" :key="item.title" :to="item.href">
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
</template>
