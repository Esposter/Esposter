<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { CreatableResourceTypes } from "@/services/resource/CreatableResourceTypes";
import { ResourceTypeDescriptionMap } from "@/services/resource/ResourceTypeDescriptionMap";
import { RoutePath } from "@esposter/shared";

interface Props {
  isDense?: true;
}

const { isDense } = defineProps<Props>();
</script>

<!-- A card per type in both densities: Home's quick create keeps a tile's name alone, the gallery has the room to say
     what each is for -->
<template>
  <div gap-3 grid :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(${isDense ? '9rem' : '14rem'}, 1fr))` }">
    <NuxtLink
      v-for="type in CreatableResourceTypes"
      :key="type"
      class="tile"
      :to="RoutePath.ResourceExplorerCreateType(type)"
      ui-card
      no-underline
      flex
      flex-col
      gap-2
      h-full
    >
      <span flex gap-2 min-w-0 items-center>
        <span :class="ResourceDefinitionMap[type].icon" aria-hidden="true" text-accent shrink-0 size-6 />
        <span truncate ui-heading>{{ ResourceDefinitionMap[type].title }}</span>
      </span>
      <span v-if="!isDense" text-muted>{{ ResourceTypeDescriptionMap[type] }}</span>
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
