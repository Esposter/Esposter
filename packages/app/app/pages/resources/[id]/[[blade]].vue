<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const id = (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) ?? "";
const bladeParam = (Array.isArray(route.params.blade) ? route.params.blade[0] : route.params.blade) ?? "";

const { load, publication, publish, remove, rename, resource, unpublish } = useResource(id);
await load();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
// Only Overview exists until type editors migrate into blades (roadmap Phase 3-5); any other blade 404s.
if (bladeParam && bladeParam !== "overview") throw createError({ statusCode: 404, statusMessage: "Blade not found" });

const isPublishable = computed(() => {
  const current = resource.value;
  return current ? "publishable" in ResourceDefinitionMap[current.type].capabilities : false;
});
const isPortable = computed(() => {
  const current = resource.value;
  return current ? "portable" in ResourceDefinitionMap[current.type].capabilities : false;
});

const isRenameDialogOpen = ref(false);
const renameValue = ref("");
const isDeleteDialogOpen = ref(false);
const onRename = async () => {
  await rename(renameValue.value);
  isRenameDialogOpen.value = false;
};
const onDelete = async () => {
  await remove();
  await navigateTo(RoutePath.ResourcesAll);
};
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ resource?.name ?? "Resource" }}</Title>
    </Head>
    <div v-if="resource" flex flex-col h-full>
      <StyledPageHeader :title="resource.name">
        <template #actions>
          <v-btn
            prepend-icon="mdi-pencil"
            variant="text"
            @click="
              renameValue = resource.name;
              isRenameDialogOpen = true;
            "
          >
            Rename
          </v-btn>
          <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="isDeleteDialogOpen = true"
            >Delete</v-btn
          >
          <template v-if="isPublishable">
            <v-btn v-if="publication" prepend-icon="mdi-cloud-off-outline" variant="tonal" @click="unpublish">
              Unpublish
            </v-btn>
            <v-btn v-else color="primary" prepend-icon="mdi-cloud-upload" @click="publish">Publish</v-btn>
          </template>
          <template v-if="isPortable">
            <v-btn disabled prepend-icon="mdi-import" variant="text">Import</v-btn>
            <v-btn disabled prepend-icon="mdi-export" variant="text">Export</v-btn>
          </template>
        </template>
      </StyledPageHeader>
      <div flex flex-1 min-h-0>
        <v-list nav border width="14rem">
          <v-list-item prepend-icon="mdi-information-outline" title="Overview" :to="RoutePath.Resource(resource.id)" />
          <v-list-item
            v-for="blade in ResourceBladeDefinitionMap[resource.type]"
            :key="blade.title"
            :prepend-icon="blade.icon"
            :title="blade.title"
          />
        </v-list>
        <div flex-1 overflow-y-auto>
          <ResourceOverview :publication :resource />
        </div>
      </div>
      <v-dialog v-model="isRenameDialogOpen" max-width="30rem">
        <v-card title="Rename resource">
          <v-card-text>
            <v-form @submit.prevent="onRename">
              <v-text-field v-model="renameValue" autofocus label="Name" :rules="resourceNameRules" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="isRenameDialogOpen = false">Cancel</v-btn>
            <v-btn color="primary" @click="onRename">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="isDeleteDialogOpen" max-width="30rem">
        <v-card title="Delete resource">
          <v-card-text>Delete "{{ resource.name }}"? This cannot be undone.</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="isDeleteDialogOpen = false">Cancel</v-btn>
            <v-btn color="error" @click="onDelete">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </NuxtLayout>
</template>
