<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto, rightDrawerOpen, rightDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar bg-transparent="!">
    <template v-if="!leftDrawerOpenAuto" #prepend>
      <v-btn icon="mdi-store" @click="leftDrawerOpen = true" />
    </template>
    <template v-if="!rightDrawerOpenAuto" #append>
      <v-btn icon="mdi-bag-personal" @click="rightDrawerOpen = true" />
    </template>
  </v-toolbar>
</template>
