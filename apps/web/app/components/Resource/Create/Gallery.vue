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
    <v-card
      v-for="type in CreatableResourceTypes"
      :key="type"
      p-4
      flex
      flex-col
      gap-2
      h-full
      :max-width="dense ? '10rem' : '18rem'"
      :to="RoutePath.ResourceExplorerCreateType(type)"
    >
      <div flex gap-2 items-center>
        <v-icon size="large" :icon="ResourceDefinitionMap[type].icon" />
        <span text-title-medium>{{ ResourceDefinitionMap[type].title }}</span>
      </div>
      <span v-if="!dense" op-medium-emphasis text-body-medium>{{ ResourceTypeDescriptionMap[type] }}</span>
    </v-card>
  </div>
</template>
