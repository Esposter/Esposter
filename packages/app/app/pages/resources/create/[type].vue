<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { isCreatableResourceType } from "@/services/resource/CreatableResourceTypes";
import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { RESOURCE_NAME_MAX_LENGTH } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const typeParam = (Array.isArray(route.params.type) ? route.params.type[0] : route.params.type) ?? "";
if (!isCreatableResourceType(typeParam)) throw createError({ statusCode: 404, statusMessage: "Unknown resource type" });

const type = typeParam;
const createResource = useCreateResource();
const name = ref("");
const isValid = ref(false);
const isSubmitting = ref(false);
const onSubmit = async () => {
  if (!isValid.value) return;
  isSubmitting.value = true;
  const resource = await createResource(type, name.value);
  await navigateTo(RoutePath.Resource(resource.id));
};
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ `Create ${ResourceDefinitionMap[type].title}` }}</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader :title="`Create ${ResourceDefinitionMap[type].title}`" />
      <div flex flex-col overflow-y-auto pa-6>
        <v-form v-model="isValid" max-width="40rem" @submit.prevent="onSubmit">
          <v-text-field
            v-model="name"
            autofocus
            :counter="RESOURCE_NAME_MAX_LENGTH"
            label="Name"
            :rules="resourceNameRules"
          />
          <div flex gap-2 justify-end mt-4>
            <v-btn variant="text" :to="RoutePath.ResourcesCreate">Cancel</v-btn>
            <v-btn color="primary" :disabled="!isValid" :loading="isSubmitting" type="submit">Create</v-btn>
          </div>
        </v-form>
      </div>
    </div>
  </NuxtLayout>
</template>
