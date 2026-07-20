<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { useNotificationStore } from "@/store/notification";
import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";
import { RoutePath } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const { executeMutation } = useMutation();
const captureDialogStore = useBlueprintCaptureDialogStore();
const { captureIds } = storeToRefs(captureDialogStore);
const { createErrorNotification, createNotification } = useNotificationStore();
// The dialog is open exactly while a selection is targeted; closing clears the target
const isOpen = computed({
  get: () => captureIds.value.length > 0,
  set: (value) => {
    if (!value) captureIds.value = [];
  },
});
const name = ref("");
watch(isOpen, (newIsOpen) => {
  if (newIsOpen) name.value = "";
});
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Save as blueprint' }"
    :confirm-button-props="{ text: 'Create' }"
    @submit="
      async (_event, onComplete) => {
        let isSuccessful = false;
        await executeMutation(() => $trpc.blueprint.captureBlueprint.mutate({ ids: captureIds, name }), {
          key: Symbol('captureBlueprint'),
          onError: createErrorNotification,
          onSuccess: async (newBlueprint) => {
            createNotification({
              action: { title: 'Go to blueprint', to: RoutePath.Resource(newBlueprint.id) },
              severity: 'success',
              title: `Created blueprint “${newBlueprint.name}”`,
            });
            isSuccessful = true;
            await navigateTo(RoutePath.Resource(newBlueprint.id));
          },
        });
        onComplete(isSuccessful);
      }
    "
  >
    <p op-medium-emphasis>
      Capture {{ captureIds.length }} {{ pluralize("resource", captureIds.length) }} into a new blueprint.
      Cross-resource links between them become aliases automatically.
    </p>
    <v-text-field v-model="name" autofocus label="Blueprint name" :rules="resourceNameRules" />
  </StyledFormDialog>
</template>
