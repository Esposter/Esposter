<script setup lang="ts">
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { CreatableResourceType } from "@/models/resource/CreatableResourceType";

import { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { getResourceBladePath } from "@/services/resource/getResourceBladePath";
import { useNotificationStore } from "@/store/notification";
import { RESOURCE_NAME_MAX_LENGTH, ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

interface Props {
  type: CreatableResourceType;
}

const { type } = defineProps<Props>();
const rules = useVRules();
const { $trpc } = useNuxtApp();
const createResource = useCreateResource();
const { executeMutation } = useMutation();
const { executeMutation: executeSaveMutation } = useMutation();
const notificationStore = useNotificationStore();
const { createErrorNotification } = notificationStore;
const name = ref("");
const isValid = ref(true);
const isSubmitting = ref(false);
// Only Sheet has a file to start from today; every other type creates name-only
const sheetResource = ref<SheetResource>();
const fileError = ref("");
// Submitting mid-parse would create an empty sheet and silently discard the import, so parsing blocks Create
const isFileParsing = ref(false);
const nameRules = computed(() => [rules.required(), rules.maxLength(RESOURCE_NAME_MAX_LENGTH)]);
const isDisabled = computed(() => !name.value || !isValid.value || Boolean(fileError.value) || isFileParsing.value);
// The create call writes no blob, so the parsed rows land through the same first save the Data blade would do.
// A failed save still leaves a valid empty sheet, so the user keeps the resource and is told what is missing
const submit = async () => {
  // Enter submits a form the button refuses, and can re-fire it while the first create mutation is still
  // Pending, which would create a duplicate resource — the button's disabled and loading states only guard clicks
  if (isDisabled.value || isSubmitting.value) return;

  isSubmitting.value = true;
  await executeMutation(() => createResource(type, name.value), {
    key: Symbol("createResource"),
    onError: createErrorNotification,
    onSuccess: async (resource) => {
      const sheetResourceValue = sheetResource.value;
      if (!sheetResourceValue) {
        await navigateTo(RoutePath.Resource(resource.id));
        return;
      }

      const saveOutcome = await executeSaveMutation(
        () =>
          $trpc.sheet.saveResourceContent.mutate({
            content: sheetResourceValue,
            contentVersion: resource.contentVersion,
            id: resource.id,
          }),
        { key: resource.id, onError: createErrorNotification },
      );
      // They came to see their rows, so a successful import lands on the Data blade rather than Overview
      await navigateTo(
        saveOutcome.status === MutationStatus.Succeeded
          ? getResourceBladePath(resource.id, ResourceBladeSlug.Data)
          : RoutePath.Resource(resource.id),
      );
    },
  });
  isSubmitting.value = false;
};
</script>

<!-- The form is the page's content, so it sits on the page across its width rather than in a card of its own -->
<template>
  <div p-4 ui-body>
    <UiForm v-model:is-valid="isValid" flex flex-col gap-4 @submit="submit()">
      <UiTextField v-model="name" :counter="RESOURCE_NAME_MAX_LENGTH" is-autofocus label="Name" :rules="nameRules" />
      <ResourceCreateSheetFile
        v-if="type === ResourceType.Sheet"
        v-model="sheetResource"
        v-model:error="fileError"
        v-model:is-parsing="isFileParsing"
        @parse="name ||= $event"
      />
      <div flex gap-2 justify-end>
        <UiButtonLink :to="RoutePath.ResourceExplorerCreate" :variant="UiButtonVariant.Quiet">Cancel</UiButtonLink>
        <UiButton :disabled="isDisabled || isSubmitting" type="submit" :variant="UiButtonVariant.Accent">
          <UiSpinner v-if="isSubmitting" />
          Create
        </UiButton>
      </div>
    </UiForm>
  </div>
</template>
