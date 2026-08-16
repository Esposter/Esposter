<script setup lang="ts">
import { Target } from "#shared/models/clicker/data/Target";
import { MenuIconMap } from "@/services/clicker/icon/MenuIconMap";

const { rotatingDivIds } = useRotatingCursors();
const icon = MenuIconMap[Target.Cursor];
</script>

<template>
  <div v-for="rotatingDivId of rotatingDivIds" :id="rotatingDivId" :key="rotatingDivId" size-50 top-0 absolute>
    <v-img select-none rotate-135 absolute width="2rem" height="2rem" :src="icon" :alt="Target.Cursor" />
  </div>
</template>
