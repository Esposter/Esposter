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
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ `Create ${ResourceDefinitionMap[type].title}` }}</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader :title="`Create ${ResourceDefinitionMap[type].title}`" />
      <div flex-1 overflow-y-auto>
        <v-container>
          <v-card max-width="40rem" mx-auto>
            <v-card-text>
              <v-form
                v-model="isValid"
                @submit.prevent="
                  async () => {
                    if (!isValid) return;
                    isSubmitting = true;
                    const resource = await createResource(type, name);
                    await navigateTo(RoutePath.Resource(resource.id));
                  }
                "
              >
                <v-text-field
                  v-model="name"
                  autofocus
                  :counter="RESOURCE_NAME_MAX_LENGTH"
                  label="Name"
                  :rules="resourceNameRules"
                />
                <div flex gap-2 justify-end mt-4>
                  <v-btn variant="text" :to="RoutePath.ResourcesCreate">Cancel</v-btn>
                  <StyledButton type="submit" :button-props="{ disabled: !isValid, loading: isSubmitting }">
                    Create
                  </StyledButton>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-container>
      </div>
    </div>
  </NuxtLayout>
</template>
