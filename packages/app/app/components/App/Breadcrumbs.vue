<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { ProductListLinkItems } from "@/services/app/ProductListLinkItems";
import { RoutePath } from "@esposter/shared";

interface AppBreadcrumbsProps {
  // Intermediate crumbs inserted between the matched product and the (disabled) title leaf
  crumbs?: BreadcrumbItem[];
  title?: string;
}

interface BreadcrumbItem {
  title: string;
  to?: string;
}

const { crumbs, title } = defineProps<AppBreadcrumbsProps>();
const route = useRoute();
const items = computed(() => {
  const result: { disabled?: boolean; title: string; to?: string }[] = [{ title: "Home", to: RoutePath.Index }];
  const products = ProductListLinkItems.flatMap((item: ListLinkItem) => item.children ?? [item]);
  const matched = products
    .filter((product) => typeof product.href === "string" && route.path.startsWith(product.href))
    .toSorted((a, b) => String(b.href).length - String(a.href).length)
    .at(0);
  if (matched && typeof matched.href === "string") result.push({ title: matched.title, to: matched.href });
  for (const crumb of crumbs ?? []) result.push({ title: crumb.title, to: crumb.to });
  if (title) result.push({ title });
  const last = result.at(-1);
  if (last) last.disabled = true;
  return result;
});
</script>

<template>
  <v-breadcrumbs :items p-0>
    <template #item="{ item }">
      <v-breadcrumbs-item
        :class="item.to && !item.disabled ? 'cursor-pointer' : undefined"
        :disabled="item.disabled"
        @click="item.to && !item.disabled && navigateTo(item.to)"
      >
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>
