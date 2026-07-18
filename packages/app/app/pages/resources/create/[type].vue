<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { isCreatableResourceType } from "@/services/resource/CreatableResourceTypes";
import { getRouteParamString } from "@/util/router/getRouteParamString";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const typeParam = getRouteParamString(route.params.type);
if (!isCreatableResourceType(typeParam)) throw createError({ statusCode: 404, statusMessage: "Unknown resource type" });

const type = typeParam;
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ `Create ${ResourceDefinitionMap[type].title}` }}</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader :title="`Create ${ResourceDefinitionMap[type].title}`" />
      <v-sheet flex-1 overflow-y-auto>
        <ResourceCreateForm :type />
      </v-sheet>
    </div>
  </NuxtLayout>
</template>
