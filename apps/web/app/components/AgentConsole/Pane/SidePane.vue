<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getEmbeddedPath } from "@/services/agentConsole/getEmbeddedPath";
import { useAgentConsolePaneStore } from "@/store/agentConsole/pane";

const agentConsolePaneStore = useAgentConsolePaneStore();
const { currentPagePath, pagePaths } = storeToRefs(agentConsolePaneStore);
const { closePage, openPage } = agentConsolePaneStore;
</script>

<template>
  <!-- One frame per open page, each kept while its tab is in the background, so a page keeps its place when it is shown
    again. Every frame is same-origin, so it shares the session's sign-in and needs nothing passed into it -->
  <div flex flex-col gap-2 min-h-0>
    <div role="tablist" aria-label="Pages" flex flex-wrap gap-1 items-center>
      <div v-for="pagePath of pagePaths" :key="pagePath" flex items-center>
        <UiButton
          :aria-selected="pagePath === currentPagePath"
          role="tab"
          :variant="pagePath === currentPagePath ? undefined : UiButtonVariant.Quiet"
          @click="openPage(pagePath)"
        >
          {{ pagePath }}
        </UiButton>
        <UiIconButton
          :label="`Close ${pagePath}`"
          :meaning="UiIconMeaning.Close"
          :variant="UiButtonVariant.Quiet"
          @click="closePage(pagePath)"
        />
      </div>
    </div>
    <iframe
      v-for="pagePath of pagePaths"
      v-show="pagePath === currentPagePath"
      :key="pagePath"
      :src="getEmbeddedPath(pagePath)"
      :title="pagePath"
      flex-1
      size-full
      min-h-0
    />
  </div>
</template>
