<script setup lang="ts">
import { API_KEY_NAME_MAX_LENGTH } from "#shared/services/auth/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiRules } from "@/services/ui/UiRules";

interface Props {
  // Answers with the whole key, which the server keeps only hashed
  create: (name: string) => Promise<string>;
}

const { create } = defineProps<Props>();
const isOpen = ref(false);
const name = ref("");
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
          createdKey = await create(name);
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
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!isValid" type="submit" :variant="UiButtonVariant.Accent">Create</UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
