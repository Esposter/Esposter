<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { ResourceInResource } from "@esposter/db-schema";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { authClient } from "@/services/auth/authClient";
import { requireAuthData } from "@/services/auth/requireAuthData";
import { checkHasResourcesKey } from "@/services/resource/checkHasResourcesKey";
import { getAssistantPrompt } from "@/services/resource/getAssistantPrompt";
import { UiRules } from "@/services/ui/UiRules";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { RoutePath } from "@esposter/shared";
import { SessionState } from "agent-console-server/contracts";

interface Props {
  resource: ResourceInResource;
}

const isOpen = defineModel<boolean>({ default: false });
const { resource } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { askAssistant } = agentConsoleConnectionStore;
const { connections } = storeToRefs(agentConsoleConnectionStore);
const agentConsolePanelStore = useAgentConsolePanelStore();
const { openConsole } = agentConsolePanelStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
const {
  apiKey: { list },
} = authClient;
// The keys the person holds, read once a dialog opens so the steps to make one show only when none holds the scope
const { data: apiKeysData } = useQuery(() => requireAuthData(list()), { isInlineError: true });
const hasResourcesKey = computed(() => (apiKeysData.value ? checkHasResourcesKey(apiKeysData.value.apiKeys) : true));
const line = ref("");
// The session the line goes to, or "" for a new one in the folder typed, as the console's own new-session panel offers
const selectedSessionId = ref(currentSessionId.value);
const editedCwd = ref("");
const isValid = ref(true);
const lineRules = [UiRules.required()];
const cwdRules = [UiRules.required()];
const sessionItems = computed<UiSelectItem<string>[]>(() => [
  { meaning: UiIconMeaning.Create, title: "A new session", value: "" },
  ...sessions.value
    .filter(({ state }) => state !== SessionState.Closed)
    .map(({ id, title }): UiSelectItem<string> => ({ meaning: UiIconMeaning.Terminal, title, value: id })),
]);

const send = () => {
  const isSent = askAssistant({
    cwd: editedCwd.value,
    sessionId: selectedSessionId.value,
    text: getAssistantPrompt(resource, line.value),
  });
  if (isSent) isOpen.value = false;
};
</script>

<!-- Ask Claude hands a line to a Claude Code session on the person's own computer, which edits the resource with
     the person's own key, so the steps shown are the ones that make both of those possible, and nothing is sent until
     both are in place -->
<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Ask Claude" w="[min(36rem,90vw)]">
    <div p-3 flex flex-col gap-3>
      <ol v-if="connections.length === 0" pl-6 list-decimal flex flex-col gap-2>
        <li>Pair the agent console with your computer, so a Claude Code session there can reach this resource.</li>
        <li><UiButton @click="openConsole(AgentConsolePanelType.Conversation)">Open the agent console</UiButton></li>
      </ol>
      <template v-else>
        <ol v-if="!hasResourcesKey" pl-6 list-decimal flex flex-col gap-2>
          <li>
            Create an API key with the Resources scope for the session to edit with, and keep it for the console.
            <div mt-2>
              <UiButtonLink :to="{ hash: `#${UserSettingsPageSection.ApiKeys}`, path: RoutePath.UserSettings }">
                API keys
              </UiButtonLink>
            </div>
          </li>
        </ol>
        <UiForm v-else v-model:is-valid="isValid" flex flex-col gap-3 @submit="send">
          <UiSelect v-model="selectedSessionId" :items="sessionItems" label="Session" />
          <UiTextField v-if="!selectedSessionId" v-model="editedCwd" label="Start a session in" :rules="cwdRules" />
          <UiTextField v-model="line" is-autofocus label="Ask Claude" :rules="lineRules" />
          <footer flex gap-2 justify-end>
            <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
            <UiButton :disabled="!isValid" type="submit" :variant="UiButtonVariant.Accent">Ask</UiButton>
          </footer>
        </UiForm>
      </template>
    </div>
  </UiDialog>
</template>
