<script setup lang="ts">
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { RoutePath } from "@esposter/shared";
// Safe here: the only read is `route.path` inside the computed below, this renders inside the page whose route
// It reads, and it holds nothing past that page. The exception is for the test: `Breadcrumbs.test.ts` has to
// Drive the current path to prove the trail drops the crumb for the page it is on, and it does that with
// `mockNuxtImport("useRoute")` — mocking `useRouter` instead replaces the router Nuxt's own plugins call
// (`router.beforeResolve`) and takes the environment down
// eslint-disable-next-line no-restricted-syntax -- the route mock a component test needs
const route = useRoute();
const navigationTrailStore = useNavigationTrailStore();
const { crumbs } = storeToRefs(navigationTrailStore);
// The hub leads every trail, the way the portal this follows keeps a root crumb on every blade: it claims no
// Ancestry — it is the one page everything here really does sit under — so a resource opened from a link still
// Has its way out. A visitor who came through it already carries it, and the hub itself drops it rather than
// Linking to the page it is on. Home needs no crumb: the logo is that link on every route
const items = computed(() => {
  const trailItems = crumbs.value.map(({ path, title }) => ({ title, to: path }));
  const isTrailFromResources = trailItems.some(({ to }) => to === RoutePath.ResourceExplorer);
  return (
    isTrailFromResources ? trailItems : [{ title: "Resource Explorer", to: RoutePath.ResourceExplorer }, ...trailItems]
  ).filter(({ to }) => to !== route.path);
});
</script>

<!-- Where the visitor came from, not where the url sits in the route tree — the page they are on is the
     header's title, never a crumb, and the hub above it is always reachable.
     See /docs/platform/breadcrumb-trail -->
<template>
  <v-breadcrumbs v-if="items.length > 0" :items p-0>
    <template #item="{ item }">
      <!-- A link, not a button: underline and background both arrive on hover, so a trail of several crumbs reads
           as one quiet line until pointed at, and it takes just enough padding to draw that background. A `v-btn`
           here brought button metrics — a control-sized hit box around text that is not a control -->
      <v-breadcrumbs-item :to="item.to" px-1 rd hover:underline hover:bg-hover>
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>
