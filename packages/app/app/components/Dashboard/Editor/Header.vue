<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { visualTypeItemCategoryDefinitions } from "@/services/dashboard/visualTypeItemCategoryDefinitions";
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";
import { RoutePath } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const visualStore = useVisualStore();
const { createVisual } = visualStore;
const { visualType } = storeToRefs(visualStore);
const dashboardStore = useDashboardStore();
const { createDocument, deleteDocument, renameDocument, saveDashboard, selectDocument, setCurrentDocument } =
  dashboardStore;
const { currentDocument, documents } = storeToRefs(dashboardStore);
</script>

<template>
  <v-toolbar>
    <v-toolbar-title font-bold px-4>
      <div pt-4 flex flex-col gap-y-4 justify-between>
        <div>Dashboard Editor</div>
        <div v-if="session.data" flex w-full items-center gap-2>
          <DocumentPicker
            :current-document="currentDocument"
            :documents
            @create="createDocument($event)"
            @delete="deleteDocument($event)"
            @rename="(id, name) => renameDocument(id, name)"
            @select="selectDocument($event)"
          />
          <DocumentPublishButton
            v-if="currentDocument"
            view-path="/view/dashboard"
            :document="currentDocument"
            @publish="
              async () => {
                await saveDashboard();
                if (currentDocument)
                  setCurrentDocument(await $trpc.dashboard.publishDocument.mutate({ id: currentDocument.id }));
              }
            "
            @unpublish="
              async () => {
                if (currentDocument)
                  setCurrentDocument(await $trpc.dashboard.unpublishDocument.mutate({ id: currentDocument.id }));
              }
            "
          />
        </div>
        <div flex w-full items-center>
          <v-select
            v-model="visualType"
            :items="visualTypeItemCategoryDefinitions"
            label="Visual Type"
            hide-details
            @update:model-value="
              $router.replace({
                query: { ...$router.currentRoute.value.query, [ITEM_TYPE_QUERY_PARAMETER_KEY]: $event },
              })
            "
          />
          <v-divider thickness="2" vertical inset mx-4 />
          <v-tooltip :text="`Add ${prettify(visualType)} Visual`">
            <template #activator="{ props }">
              <v-btn ml-2 variant="elevated" :flat="false" :="props" @click="createVisual">
                <v-icon icon="mdi-plus" />
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Dashboard">
            <template #activator="{ props }">
              <v-btn ml-2 variant="elevated" :flat="false" :="props" @click="navigateTo(RoutePath.Dashboard)">
                <v-icon icon="mdi-view-dashboard" />
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
    </v-toolbar-title>
  </v-toolbar>
</template>
