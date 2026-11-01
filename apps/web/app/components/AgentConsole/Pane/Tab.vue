<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useAgentConsolePaneStore } from "@/store/agentConsole/pane";

interface Props {
  pagePath: string;
}

const { pagePath } = defineProps<Props>();
const agentConsolePaneStore = useAgentConsolePaneStore();
const { currentPagePath } = storeToRefs(agentConsolePaneStore);
const { closePage, openPage } = agentConsolePaneStore;
</script>

<template>
  <div flex items-center>
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
</template>
