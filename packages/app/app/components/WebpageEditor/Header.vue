<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { RoutePath } from "@esposter/shared";

const session = authClient.useSession();
const webpageEditorStore = useWebpageEditorStore();
const { createResource, deleteResource, publishWebpage, renameResource, selectResource, unpublishWebpage } =
  webpageEditorStore;
const { currentResource, resources } = storeToRefs(webpageEditorStore);
</script>

<template>
  <StyledPageHeader>
    <template v-if="session.data" #identity>
      <ResourcePicker
        :current-resource
        :resources
        @create="createResource($event)"
        @delete="deleteResource($event)"
        @rename="(id, name) => renameResource(id, name)"
        @select="selectResource($event)"
      />
    </template>
    <template v-if="session.data && currentResource" #actions>
      <ResourcePublishButton
        :resource="currentResource"
        :view-path="RoutePath.ViewWebpage"
        @publish="publishWebpage()"
        @unpublish="unpublishWebpage()"
      />
    </template>
  </StyledPageHeader>
</template>
