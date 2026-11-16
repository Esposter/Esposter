<script setup lang="ts">
import { Target } from "#shared/models/clicker/data/Target";
import { MenuIconMap } from "#src/services/clicker/icon/MenuIconMap";
import { omitUndefined } from "@esposter/shared";

const { rotatingDivIds } = useRotatingCursors();
const icon = MenuIconMap[Target.Cursor];
</script>

<template>
  <div v-for="rotatingDivId of rotatingDivIds" :id="rotatingDivId" :key="rotatingDivId" size-50 top-0 absolute>
    <NuxtImg
      :="omitUndefined({ src: icon })"
      size-8
      select-none
      rotate-135
      absolute
      object-contain
      :alt="Target.Cursor"
    />
  </div>
</template>
