<script setup lang="ts">
import type { SideBarItem } from "@/models/user/SideBarItem";

interface StyledSideBar {
  items: SideBarItem[];
}

const { items } = defineProps<StyledSideBar>();
</script>

<template>
  <StyledCard>
    <v-list px-2>
      <!-- Path plus hash, not fullPath: two items can share a path and differ only by hash, but a query the page
           Was navigated to with (the link callback's `?error=`) belongs to no item and must not deselect them all -->
      <v-list-item
        v-for="{ title, href } of items"
        :key="href"
        rd
        :active="$route.path + $route.hash === href"
        :to="href"
      >
        {{ title }}
      </v-list-item>
    </v-list>
  </StyledCard>
</template>
