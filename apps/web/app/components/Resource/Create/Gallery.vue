<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { CreatableResourceTypes } from "@/services/resource/CreatableResourceTypes";
import { ResourceTypeDescriptionMap } from "@/services/resource/ResourceTypeDescriptionMap";
import { RoutePath } from "@esposter/shared";

interface Props {
  dense?: boolean;
}

const { dense = false } = defineProps<Props>();
</script>

<template>
  <div gap-4 grid :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(${dense ? '8rem' : '14rem'}, 1fr))` }">
    <NuxtLink
      v-for="type in CreatableResourceTypes"
      :key="type"
      class="tile"
      :to="RoutePath.ResourceExplorerCreateType(type)"
      p-4
      no-underline
      flex
      flex-col
      gap-2
      h-full
      ui-frame
    >
      <!-- A dense column is too narrow for the icon and a one-word title side by side, so the title goes under it -->
      <div flex gap-2 items-center :class="{ 'flex-col text-center': dense }">
        <span :class="ResourceDefinitionMap[type].icon" aria-hidden="true" text-accent size-8 />
        <span ui-heading>{{ ResourceDefinitionMap[type].title }}</span>
      </div>
      <span v-if="!dense" text-muted>{{ ResourceTypeDescriptionMap[type] }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
/* A tile rises a step toward the pointer, as something to press does */
.tile {
  color: var(--ui-text);
  transition: translate var(--ui-motion-short);
}

.tile:hover {
  translate: 0 calc(var(--ui-step) * -1);
}
</style>
