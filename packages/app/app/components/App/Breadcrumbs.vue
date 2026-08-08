<script setup lang="ts">
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { RoutePath } from "@esposter/shared";

const route = useRoute();
const navigationTrailStore = useNavigationTrailStore();
const { crumbs } = storeToRefs(navigationTrailStore);
// The hub leads every trail, the way the portal this follows keeps a root crumb on every blade: it claims no
// Ancestry — it is the one page everything here really does sit under — so a resource opened from a link still
// Has its way out. A visitor who came through it already carries it, and the hub itself drops it rather than
// Linking to the page it is on. Home needs no crumb: the logo is that link on every route
const items = computed(() => {
  const trailItems = crumbs.value.map(({ path, title }) => ({ title, to: path }));
  const isTrailFromResources = trailItems.some(({ to }) => to === RoutePath.Resources);
  return (isTrailFromResources ? trailItems : [{ title: "Resources", to: RoutePath.Resources }, ...trailItems]).filter(
    ({ to }) => to !== route.path,
  );
});
</script>

<!-- Where the visitor came from, not where the url sits in the route tree — the page they are on is the
     header's title, never a crumb, and the hub above it is always reachable.
     See /docs/platform/breadcrumb-trail -->
<template>
  <v-breadcrumbs v-if="items.length > 0" :items p-0>
    <template #item="{ item }">
      <v-breadcrumbs-item :to="item.to">
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>
