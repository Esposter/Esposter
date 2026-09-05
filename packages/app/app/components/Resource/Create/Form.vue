<script setup lang="ts">
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { CreatableResourceType } from "@/services/resource/CreatableResourceTypes";

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
const isValid = ref(false);
const isSubmitting = ref(false);
// Only Sheet has a file to start from today; every other type creates name-only
const sheetResource = ref<SheetResource>();
const fileError = ref("");
// Submitting mid-parse would create an empty sheet and silently discard the import, so parsing blocks Create
const isFileParsing = ref(false);
const nameRules = computed(() => [rules.required(), rules.maxLength(RESOURCE_NAME_MAX_LENGTH)]);
const buttonProps = computed(() => ({
  disabled: !isValid.value || Boolean(fileError.value) || isFileParsing.value,
  loading: isSubmitting.value,
}));
// The create call writes no blob, so the parsed rows land through the same first save the Data blade would do.
// A failed save still leaves a valid empty sheet, so the user keeps the resource and is told what is missing
const submit = async () => {
  // Enter can re-fire the form while the first create mutation is still pending, which would create a
  // Duplicate resource — the button's loading state only guards clicks, not the keyboard
  if (isSubmitting.value) return;

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

      let isSaved = false;
      await executeSaveMutation(
        () =>
          $trpc.sheet.saveResourceContent.mutate({
            content: sheetResourceValue,
            contentVersion: resource.contentVersion,
            id: resource.id,
          }),
        {
          key: resource.id,
          onError: createErrorNotification,
          onSuccess: () => {
            isSaved = true;
          },
        },
      );
      // They came to see their rows, so a successful import lands on the Data blade rather than Overview
      await navigateTo(isSaved ? `${RoutePath.Resource(resource.id)}/data` : RoutePath.Resource(resource.id));
    },
  });
  isSubmitting.value = false;
};
</script>

<template>
  <v-container>
    <v-card max-width="40rem" mx-auto>
      <v-card-text>
        <v-form
          v-model="isValid"
          @submit.prevent="
            async () => {
              if (!isValid || fileError || isFileParsing) return;
              await submit();
            }
          "
        >
          <v-text-field v-model="name" autofocus :counter="RESOURCE_NAME_MAX_LENGTH" label="Name" :rules="nameRules" />
          <ResourceCreateSheetFile
            v-if="type === ResourceType.Sheet"
            v-model="sheetResource"
            v-model:error="fileError"
            v-model:is-parsing="isFileParsing"
            @parse="name ||= $event"
          />
          <div mt-4 flex gap-2 justify-end>
            <v-btn :to="RoutePath.ResourceExplorerCreate" variant="text">Cancel</v-btn>
            <StyledButton type="submit" :button-props> Create </StyledButton>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
