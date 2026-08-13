<script setup lang="ts">
import { Target } from "#shared/models/clicker/data/Target";
import { getGlobImage } from "@/services/clicker/getGlobImage";

const { rotatingDivIds } = useRotatingCursors();
const icon = computed(() =>
  getGlobImage(
    import.meta.glob<string>("@/assets/clicker/icons/menu/*.png", { eager: true, import: "default" }),
    Target.Cursor,
  ),
);
</script>

<template>
  <div v-for="rotatingDivId of rotatingDivIds" :id="rotatingDivId" :key="rotatingDivId" size-50 top-0 absolute>
    <v-img select-none rotate-135 absolute width="2rem" height="2rem" :src="icon" :alt="Target.Cursor" />
  </div>
</template>
