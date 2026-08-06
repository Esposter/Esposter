<script setup lang="ts">
const { crumbs } = useNavigationTrail();
</script>

<!-- Where the visitor came from, not where the url sits in the route tree — the page they are on is the
     header's title, and a page they arrived at directly has nothing above it to render.
     See /docs/platform/breadcrumb-trail -->
<template>
  <v-breadcrumbs v-if="crumbs.length > 0" :items="crumbs" p-0>
    <template #item="{ item }">
      <v-breadcrumbs-item :to="item.to">
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>
