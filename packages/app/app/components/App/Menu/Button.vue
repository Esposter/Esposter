<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { ProductListLinkItems } from "@/services/app/ProductListLinkItems";
import { RoutePath } from "@esposter/shared";

const items: ListLinkItem[] = [
  {
    href: RoutePath.PostCreate,
    icon: "mdi-square-edit-outline",
    title: "Create Post",
  },
  ...ProductListLinkItems,
];
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
      <AppMenuLinkList :items @select="menu = false" />
    </StyledTooltipMenuIconButton>
  </v-avatar>
</template>
