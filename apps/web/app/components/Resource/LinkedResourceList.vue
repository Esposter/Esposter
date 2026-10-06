<script setup lang="ts">
import type { LinkedResource } from "#shared/models/resource/LinkedResource";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface Props {
  resources: LinkedResource[];
}

const { resources } = defineProps<Props>();
</script>

<!-- Each row goes to the resource it names, leading with its type's mark -->
<template>
  <ul flex flex-col>
    <li v-for="{ id, name, type } of resources" :key="id">
      <NuxtLink :to="RoutePath.Resource(id)" ui-item>
        <UiItemContent
          :description="ResourceDefinitionMap[type].title"
          :icon="ResourceDefinitionMap[type].icon"
          :title="name"
        />
      </NuxtLink>
    </li>
  </ul>
</template>
