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
  <div flex flex-wrap gap-4>
    <v-card
      v-for="type in CreatableResourceTypes"
      :key="type"
      flex
      flex-col
      gap-2
      pa-4
      :max-width="dense ? '10rem' : '18rem'"
      :min-width="dense ? '8rem' : '14rem'"
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
