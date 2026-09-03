<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { checkIsCreatableResourceType } from "@/services/resource/CreatableResourceTypes";
import { getRouteParamString } from "@/util/router/getRouteParamString";

definePageMeta({ middleware: "auth" });

const { currentRoute } = useRouter();
const typeParam = getRouteParamString(currentRoute.value.params.type);
if (!checkIsCreatableResourceType(typeParam))
  throw createError({ statusCode: 404, statusMessage: "Unknown resource type" });

const type = typeParam;
</script>

<template>
  <NuxtLayout name="resource" :title="`Create ${ResourceDefinitionMap[type].title}`">
    <Head>
      <Title>{{ `Create ${ResourceDefinitionMap[type].title}` }}</Title>
    </Head>
    <v-sheet flex-1 overflow-y-auto>
      <ResourceCreateForm :type />
    </v-sheet>
  </NuxtLayout>
</template>
