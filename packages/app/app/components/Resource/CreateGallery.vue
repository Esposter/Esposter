<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { CreatableResourceTypes } from "@/services/resource/CreatableResourceTypes";
import { ResourceTypeDescriptionMap } from "@/services/resource/ResourceTypeDescriptionMap";
import { RoutePath } from "@esposter/shared";

interface CreateGalleryProps {
  dense?: boolean;
}

const { dense = false } = defineProps<CreateGalleryProps>();
</script>

<template>
  <div gap-4 grid :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(${dense ? '8rem' : '14rem'}, 1fr))` }">
    <v-card
      v-for="type in CreatableResourceTypes"
      :key="type"
      link
      p-4
      flex
      flex-col
      gap-2
      h-full
      :max-width="dense ? '10rem' : '18rem'"
      @click="navigateTo(RoutePath.ResourcesCreateType(type))"
    >
      <div flex gap-2 items-center>
        <v-icon size="large" :icon="ResourceDefinitionMap[type].icon" />
        <span text-subtitle-1>{{ ResourceDefinitionMap[type].title }}</span>
      </div>
      <span v-if="!dense" text-body-2 text-medium-emphasis>{{ ResourceTypeDescriptionMap[type] }}</span>
    </v-card>
  </div>
</template>
