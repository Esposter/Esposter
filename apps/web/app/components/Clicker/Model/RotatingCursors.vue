<script setup lang="ts">
import { Target } from "#shared/models/clicker/data/Target";
import { MenuIconMap } from "@/services/clicker/icon/MenuIconMap";

const { rotatingDivIds } = useRotatingCursors();
const icon = MenuIconMap[Target.Cursor];
</script>

<template>
  <div v-for="rotatingDivId of rotatingDivIds" :id="rotatingDivId" :key="rotatingDivId" size-50 top-0 absolute>
    <NuxtImg size-8 select-none rotate-135 absolute object-contain :src="icon" :alt="Target.Cursor" />
  </div>
</template>
