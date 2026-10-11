<script setup lang="ts">
import type { McpScope } from "#shared/models/auth/McpScope";
import type { CreateApiKeyInput } from "#shared/models/db/user/CreateApiKeyInput";

import { McpScopes } from "#shared/models/auth/McpScope";
import { API_KEY_NAME_MAX_LENGTH } from "#shared/services/auth/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { McpScopeTitleMap } from "@/services/auth/McpScopeTitleMap";
import { UiRules } from "@/services/ui/UiRules";

interface Props {
  // Answers with the whole key, which the server keeps only hashed
  create: (input: CreateApiKeyInput) => Promise<string>;
}

const { create } = defineProps<Props>();
const isOpen = ref(false);
const name = ref("");
// What the key reaches, and nothing until the owner ticks it: a key is made for one kind of work
const mcpScopes = ref<McpScope[]>([]);
const isValid = ref(true);
// Shown once, on the dialog that created it, and gone with the dialog
const createdKey = ref("");
const nameRules = [UiRules.required(), UiRules.maxLength(API_KEY_NAME_MAX_LENGTH)];
const { answer } = useDialogAnswer(isOpen);
</script>

<template>
  <!-- Mounted once beside the heading, so it is the button and its dialog in one component -->
  <UiButton
    aria-haspopup="dialog"
    @click="
      () => {
        name = createdKey = '';
        mcpScopes = [];
        isOpen = true;
      }
    "
  >
    <UiIcon :meaning="UiIconMeaning.Create" />
    Create key
  </UiButton>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Create API key" w="[min(32rem,90vw)]">
    <div v-if="createdKey" p-3 flex flex-col gap-3>
      <p>Copy the key now. It is shown only once; a lost key is deleted and replaced.</p>
      <div px-3 py-2 flex gap-2 items-center ui-field>
        <code flex-1 break-all>{{ createdKey }}</code>
        <UiCopyButton label="Copy API key" :source="createdKey" />
      </div>
      <footer flex justify-end>
        <UiButton :variant="UiButtonVariant.Accent" @click="isOpen = false">Done</UiButton>
      </footer>
    </div>
    <!-- The dialog stays open on a created key, which is shown in its place rather than closed over -->
    <UiForm
      v-else
      v-model:is-valid="isValid"
      p-3
      flex
      flex-col
      gap-3
      @submit="
        answer(async () => {
          createdKey = await create({ mcpScopes, name });
          return false;
        })
      "
    >
      <UiTextField
        v-model="name"
        hint="Where the key is used, such as the machine an agent runs on"
        is-autofocus
        label="Name"
        :rules="nameRules"
      />
      <p text-muted>
        What the key reaches: Follow-ups is the TodoList's follow-ups a coding session writes and works through,
        Resources finds, reads and edits the content of every resource you own.
      </p>
      <div role="group" aria-label="Scopes" flex flex-col gap-2>
        <UiCheckbox
          v-for="mcpScope of McpScopes"
          :key="mcpScope"
          is-label-shown
          :label="McpScopeTitleMap[mcpScope]"
          :model-value="mcpScopes.includes(mcpScope)"
          @update:model-value="
            (isChecked) => {
              mcpScopes = isChecked
                ? McpScopes.filter((scope) => scope === mcpScope || mcpScopes.includes(scope))
                : mcpScopes.filter((scope) => scope !== mcpScope);
            }
          "
        />
      </div>
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!isValid || mcpScopes.length === 0" type="submit" :variant="UiButtonVariant.Accent">
          Create
        </UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
