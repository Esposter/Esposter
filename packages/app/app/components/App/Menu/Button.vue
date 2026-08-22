<script setup lang="ts">
// `Create Post` used to lead this list, from before the feed had an entry point of its own. It is not a product,
// And the feed the grid's own reader lands on now carries it — so what is left here is the products
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
