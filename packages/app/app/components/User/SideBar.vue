<script setup lang="ts">
import type { SideBarItem } from "@/models/user/SideBarItem";

interface StyledSideBar {
  items: SideBarItem[];
}

const { items } = defineProps<StyledSideBar>();
</script>

<template>
  <StyledCard>
    <v-list px-2="!">
      <v-list-item
        v-for="{ title, href } of items"
        :key="href"
        rd="!"
        :active="$route.path === href"
        @click="navigateTo(href)"
      >
        {{ title }}
      </v-list-item>
    </v-list>
  </StyledCard>
</template>
