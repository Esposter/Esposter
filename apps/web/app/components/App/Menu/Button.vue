<script setup lang="ts">
import { ProductListLinkItems } from "@/services/app/ProductListLinkItems";

const menu = ref(false);
</script>

<template>
  <v-avatar color="background">
    <StyledTooltipMenuIconButton
      v-model="menu"
      icon="mdi-dots-grid"
      :menu-props="{ closeOnContentClick: false, location: 'bottom start' }"
      text="Menu"
      :tooltip-props="{ location: 'bottom' }"
    >
      <AppMenuLinkList :items="ProductListLinkItems" @select="menu = false" />
    </StyledTooltipMenuIconButton>
  </v-avatar>
</template>
