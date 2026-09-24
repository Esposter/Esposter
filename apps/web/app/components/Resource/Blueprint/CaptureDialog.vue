<script setup lang="ts">
import { MAX_BLUEPRINT_ENTRIES } from "#shared/services/resource/blueprint/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { useNotificationStore } from "@/store/notification";
import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";
import { NotificationSeverity, RESOURCE_NAME_MAX_LENGTH } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

const rules = useVRules();
const { $trpc } = useNuxtApp();
const { executeMutation, isPending } = useMutation();
const captureDialogStore = useBlueprintCaptureDialogStore();
const { captureIds } = storeToRefs(captureDialogStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
// The dialog is open exactly while a selection is targeted; closing clears the target
const isOpen = computed({
  get: () => captureIds.value.length > 0,
  set: (newIsOpen) => {
    if (!newIsOpen) captureIds.value = [];
  },
});
const name = ref("");
// The manifest caps its entries, so the selection is checked here rather than letting the user name a
// Blueprint the server will reject — with the count to drop, which the schema's rejection cannot tell them
const overLimitCount = computed(() => Math.max(0, captureIds.value.length - MAX_BLUEPRINT_ENTRIES));
const nameRules = computed(() => [rules.required(), rules.maxLength(RESOURCE_NAME_MAX_LENGTH)]);
const isValid = ref(true);
watch(isOpen, (newIsOpen) => {
  if (newIsOpen) name.value = "";
});
// The target lives in a store that outlives this mount, while the dialog is mounted inside the resource
// List — navigating away with it open would otherwise leave the target armed, re-opening the dialog over a
// Stale selection the next time the list renders
onUnmounted(() => {
  captureIds.value = [];
});
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Save as blueprint" w="[min(32rem,90vw)]">
    <UiForm
      v-model:is-valid="isValid"
      p-3
      flex
      flex-col
      gap-3
      @submit="
        async () => {
          const outcome = await executeMutation(
            () => $trpc.blueprint.captureBlueprint.mutate({ ids: captureIds, name }),
            {
              key: Symbol('captureBlueprint'),
              onError: createErrorNotification,
              onSuccess: async (newBlueprint) => {
                createNotification({
                  action: { title: 'Go to blueprint', to: RoutePath.Resource(newBlueprint.id) },
                  severity: NotificationSeverity.Success,
                  title: `Created blueprint “${newBlueprint.name}”`,
                });
                await navigateTo(RoutePath.Resource(newBlueprint.id));
              },
            },
          );
          if (outcome.status === MutationStatus.Succeeded) isOpen = false;
        }
      "
    >
      <p text-muted>
        Capture {{ captureIds.length }} {{ pluralize("resource", captureIds.length) }} into a new blueprint.
        Cross-resource links between them become aliases automatically.
      </p>
      <UiAlert v-if="overLimitCount > 0" status="error">
        A blueprint holds at most {{ MAX_BLUEPRINT_ENTRIES }} resources — deselect {{ overLimitCount }}
        {{ pluralize("resource", overLimitCount) }} to continue.
      </UiAlert>
      <UiTextField v-model="name" is-autofocus label="Blueprint name" :rules="nameRules" />
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton
          :disabled="!isValid || overLimitCount > 0 || isPending"
          type="submit"
          :variant="UiButtonVariant.Accent"
        >
          <UiSpinner v-if="isPending" />
          Create
        </UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
