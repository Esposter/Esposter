<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { useResourceStore } from "@/store/resource";
import { RoutePath } from "@esposter/shared";

const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const { origin } = useRequestURL();
const isOpen = ref(false);
// The follow-ups plugin's install, from the repository's own marketplace
const installCommands = [
  "claude plugin marketplace add Esposter/Esposter",
  "claude plugin install follow-ups@esposter",
];
</script>

<!-- How a Claude Code session comes to write its follow-ups into this list: a key from the settings, the plugin, and the
     Three values its install asks for, each with a copy button -->
<template>
  <UiIconButton
    aria-haspopup="dialog"
    label="Connect an agent"
    :meaning="UiIconMeaning.Terminal"
    :variant="UiButtonVariant.Quiet"
    @click="isOpen = true"
  />
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Connect an agent" w="[min(36rem,90vw)]">
    <ol p-3 list-decimal list-inside flex flex-col gap-4>
      <li>
        Create an API key for the agent, and keep it for the last step.
        <div mt-2>
          <UiButtonLink :to="{ hash: `#${UserSettingsPageSection.ApiKeys}`, path: RoutePath.UserSettings }">
            API keys
          </UiButtonLink>
        </div>
      </li>
      <li>
        Install the follow-ups plugin for Claude Code.
        <div
          v-for="installCommand of installCommands"
          :key="installCommand"
          mt-2
          px-3
          py-1
          flex
          gap-2
          items-center
          ui-field
        >
          <code flex-1 break-all>{{ installCommand }}</code>
          <UiCopyButton label="Copy command" :source="installCommand" />
        </div>
      </li>
      <li>
        Give the install this site, this list's id and the key when it asks. Sessions in any repository then write the
        follow-ups they leave into this list, and a drain works through them.
        <div mt-2 px-3 py-1 flex gap-2 items-center ui-field>
          <code flex-1 break-all>{{ origin }}</code>
          <UiCopyButton label="Copy site" :source="origin" />
        </div>
        <div mt-2 px-3 py-1 flex gap-2 items-center ui-field>
          <code flex-1 break-all>{{ currentResourceId }}</code>
          <UiCopyButton label="Copy list id" :source="currentResourceId" />
        </div>
      </li>
    </ol>
  </UiDialog>
</template>
