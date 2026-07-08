<script setup lang="ts">
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

// Built-in blades every resource has in Phase 2; per-type blades (ResourceBladeDefinitionMap) join as editors migrate.
const BLADE_SLUGS = ["overview", "editor"] as const;

const route = useRoute();
const id = (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) ?? "";
const bladeParam = (Array.isArray(route.params.blade) ? route.params.blade[0] : route.params.blade) ?? "";

const { load, publication, publish, remove, rename, resource, unpublish } = useResource(id);
await load();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
if (bladeParam && !BLADE_SLUGS.some((slug) => slug === bladeParam))
  throw createError({ statusCode: 404, statusMessage: "Blade not found" });

// Two flex boxes (list | blade); the caret collapses the list box so the blade fills the row.
// Collapse by default on mobile so the blade gets the full width.
const { smAndDown } = useVDisplay();
const isListCollapsed = ref(smAndDown.value);
const activeBlade = bladeParam || "overview";
const bladeItems = computed(() => {
  const current = resource.value;
  if (!current) return [];
  return [
    { icon: "mdi-information-outline", slug: "overview", title: "Overview" },
    { icon: ResourceDefinitionMap[current.type].icon, slug: "editor", title: "Editor" },
  ];
});
const activeBladeTitle = computed(
  () => bladeItems.value.find((item) => item.slug === activeBlade)?.title ?? "Overview",
);
const bladePath = (slug: string) =>
  slug === "overview" ? RoutePath.Resource(id) : `${RoutePath.Resource(id)}/${slug}`;
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
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ resource?.name ?? "Resource" }}</Title>
    </Head>
    <div v-if="resource" flex flex-col h-full>
      <!-- The single unified breadcrumb lives in the base page and updates with the open resource -->
      <StyledPageHeader>
        <template #breadcrumbs>
          <AppBreadcrumbs :crumbs="[{ title: 'All', to: RoutePath.ResourcesAll }]" :title="resource.name" />
        </template>
      </StyledPageHeader>
      <!-- Two flex boxes on one surface: the list box (collapsible) and the blade box -->
      <v-sheet flex flex-1>
        <div v-if="isListCollapsed" pt-2>
          <StyledTooltipIconButton icon="mdi-chevron-double-right" text="Show list" @click="isListCollapsed = false" />
        </div>
        <div v-else flex flex-col>
          <v-toolbar title="Resources">
            <template #prepend>
              <StyledTooltipIconButton
                icon="mdi-chevron-double-left"
                text="Hide list"
                @click="isListCollapsed = true"
              />
            </template>
          </v-toolbar>
          <ResourceListView :searchable="false" />
        </div>
        <div flex flex-1 flex-col>
          <v-toolbar>
            <template #prepend>
              <v-icon :icon="ResourceDefinitionMap[resource.type].icon" />
            </template>
            <div flex flex-col>
              <span text-h6>{{ resource.name }} | {{ activeBladeTitle }}</span>
              <span text-caption op-medium-emphasis>{{ ResourceDefinitionMap[resource.type].title }}</span>
            </div>
            <v-spacer />
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
            <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="isDeleteDialogOpen = true">
              Delete
            </v-btn>
            <template v-if="isPublishable">
              <v-btn v-if="publication" prepend-icon="mdi-cloud-off-outline" variant="tonal" @click="unpublish">
                Unpublish
              </v-btn>
              <StyledButton v-else :button-props="{ prependIcon: 'mdi-cloud-upload' }" @click="publish">
                Publish
              </StyledButton>
            </template>
            <template v-if="isPortable">
              <v-btn disabled prepend-icon="mdi-import" variant="text">Import</v-btn>
              <v-btn disabled prepend-icon="mdi-export" variant="text">Export</v-btn>
            </template>
            <StyledTooltipIconButton icon="mdi-close" text="Close" :button-props="{ to: RoutePath.ResourcesAll }" />
          </v-toolbar>
          <div flex flex-1>
            <v-list nav b-e-1 b-border b-solid :width="smAndDown ? '3.5rem' : '16rem'">
              <v-list-item
                v-for="item in bladeItems"
                :key="item.slug"
                :active="activeBlade === item.slug"
                :prepend-icon="item.icon"
                :title="smAndDown ? undefined : item.title"
                :to="bladePath(item.slug)"
              />
            </v-list>
            <div flex-1 overflow-y-auto>
              <ResourceOverview v-if="activeBlade === 'overview'" :publication :resource />
              <ResourceEditorLaunch v-else :resource />
            </div>
          </div>
        </div>
      </v-sheet>
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
            <StyledButton @click="onRename">Save</StyledButton>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="isDeleteDialogOpen" max-width="30rem">
        <v-card title="Delete resource">
          <v-card-text>Delete "{{ resource.name }}"? This cannot be undone.</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="isDeleteDialogOpen = false">Cancel</v-btn>
            <v-btn
              color="error"
              @click="
                async () => {
                  if (await remove()) await navigateTo(RoutePath.ResourcesAll);
                }
              "
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </NuxtLayout>
</template>
