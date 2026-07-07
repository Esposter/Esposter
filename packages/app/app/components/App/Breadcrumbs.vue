<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { ProductListLinkItems } from "@/services/app/ProductListLinkItems";
import { RoutePath } from "@esposter/shared";

interface AppBreadcrumbsProps {
  title?: string;
}

const { title } = defineProps<AppBreadcrumbsProps>();
const route = useRoute();
const items = computed(() => {
  const crumbs: { disabled?: boolean; title: string; to?: string }[] = [{ title: "Home", to: RoutePath.Index }];
  const products = ProductListLinkItems.flatMap((item: ListLinkItem) => item.children ?? [item]);
  const matched = products
    .filter((product) => typeof product.href === "string" && route.path.startsWith(product.href))
    .toSorted((a, b) => String(b.href).length - String(a.href).length)
    .at(0);
  if (matched && typeof matched.href === "string") crumbs.push({ title: matched.title, to: matched.href });
  if (title) crumbs.push({ title });
  const last = crumbs.at(-1);
  if (last) last.disabled = true;
  return crumbs;
});
</script>

<template>
  <v-breadcrumbs :items pa-0 />
</template>
