<script setup lang="ts">
import { APP_BAR_MENU_PROPS, APP_BAR_TOOLTIP_PROPS } from "@/services/app/constants";
import { ProductListLinkItems } from "@/services/app/ProductListLinkItems";

const menu = ref(false);
</script>

<template>
  <v-avatar color="background">
    <StyledTooltipMenuIconButton
      v-model="menu"
      icon="mdi-dots-grid"
      :menu-props="APP_BAR_MENU_PROPS"
      text="Menu"
      :tooltip-props="APP_BAR_TOOLTIP_PROPS"
    >
      <AppMenuLinkList :items="ProductListLinkItems" @select="menu = false" />
    </StyledTooltipMenuIconButton>
  </v-avatar>
</template>
