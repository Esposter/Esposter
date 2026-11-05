<script setup lang="ts">
import type { ResourceInResource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { authClient } from "@/services/auth/authClient";
import { requireAuthData } from "@/services/auth/requireAuthData";
import { checkHasResourcesKey } from "@/services/resource/checkHasResourcesKey";
import { getAssistantPrompt } from "@/services/resource/getAssistantPrompt";
import { UiRules } from "@/services/ui/UiRules";
import { RoutePath } from "@esposter/shared";

interface Props {
  resource: ResourceInResource;
}

const isOpen = defineModel<boolean>({ default: false });
const { resource } = defineProps<Props>();
const {
  apiKey: { list },
} = authClient;
// The keys the person holds, read once a dialog opens so the steps to make one show only when none holds the scope
const { data: apiKeysData } = useQuery(() => requireAuthData(list()), { isInlineError: true });
const hasResourcesKey = computed(() => (apiKeysData.value ? checkHasResourcesKey(apiKeysData.value.apiKeys) : true));
const line = ref("");
const lineRules = [UiRules.required()];
const prompt = computed(() => getAssistantPrompt(resource, line.value));
</script>

<!-- Ask Claude composes the line for whichever agent the person already runs, which edits the resource with the
     person's own key, so the one step shown first is that key, and the prompt is offered once there is a line -->
<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Ask Claude" w="[min(36rem,90vw)]">
    <div p-3 flex flex-col gap-3>
      <ol v-if="!hasResourcesKey" pl-6 list-decimal flex flex-col gap-2>
        <li>
          Create an API key with the Resources scope for the agent to edit with, and keep it for its connection.
          <div mt-2>
            <UiButtonLink :to="{ hash: `#${UserSettingsPageSection.ApiKeys}`, path: RoutePath.UserSettings }">
              API keys
            </UiButtonLink>
          </div>
        </li>
      </ol>
      <template v-else>
        <UiTextField v-model="line" is-autofocus label="Ask Claude" :rules="lineRules" />
        <div v-if="line" pl-3 pr-1 py-1 flex gap-2 items-center ui-field>
          <code flex-1 break-all>{{ prompt }}</code>
          <UiCopyButton label="Copy prompt" :source="prompt" />
        </div>
        <footer flex justify-end>
          <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Close</UiButton>
        </footer>
      </template>
    </div>
  </UiDialog>
</template>
