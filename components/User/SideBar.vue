<script setup lang="ts">
import type { SideBarItem } from "@/models/user/SideBarItem";

interface StyledSideBar {
  items: SideBarItem[];
}

const { items } = defineProps<StyledSideBar>();
const route = useRoute();
</script>

<template>
  <StyledCard>
    <v-list px-2="!">
      <v-list-item
        v-for="{ title, href } in items"
        :key="href"
        rd-1="!"
        :active="route.path === href"
        @click="navigateTo(href)"
      >
        {{ title }}
      </v-list-item>
    </v-list>
  </StyledCard>
</template>
