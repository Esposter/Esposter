<script setup lang="ts">
import type { BlueprintDeployment } from "#shared/models/resource/blueprint/BlueprintDeployment";

import { buildBlueprintDeployReviews } from "#shared/services/resource/blueprint/buildBlueprintDeployReviews";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { useBlueprintStore } from "@/store/resource/blueprint";
import { RoutePath } from "@esposter/shared";

interface Props {
  // Set while the manifest on screen differs from the saved one, since a deploy runs the saved manifest
  isDisabled?: true;
}

defineProps<Props>();
const { $trpc } = useNuxtApp();
const { executeMutation, isPending: isDeployPending } = useMutation();
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const blueprintStore = useBlueprintStore();
const { blueprint } = storeToRefs(blueprintStore);
const notificationStore = useNotificationStore();
const { createErrorNotification } = notificationStore;
const isOpen = ref(false);
const parameterValues = ref<Record<string, string>>({});
const deployments = ref<BlueprintDeployment[]>([]);
// Each open starts fresh: fields prefilled from their defaults, previous results cleared
watch(isOpen, (newIsOpen) => {
  if (!newIsOpen) return;

  parameterValues.value = Object.fromEntries(
    blueprint.value.parameters.map(({ defaultValue, key }) => [key, defaultValue]),
  );
  deployments.value = [];
});
// What each entry will be created as, resolved from the fields as they are typed
const deployReviews = computed(() => buildBlueprintDeployReviews(blueprint.value.entries, parameterValues.value));
const isDeployBlocked = computed(() => deployReviews.value.some(({ isNameEmpty }) => isNameEmpty));
const deploy = async () => {
  const resourceValue = resource.value;
  if (!resourceValue) return;

  await executeMutation(
    () => $trpc.blueprint.deployBlueprint.mutate({ id: resourceValue.id, parameterValues: parameterValues.value }),
    {
      key: resourceValue.id,
      onError: createErrorNotification,
      onSuccess: (newDeployments) => {
        deployments.value = newDeployments;
      },
    },
  );
};
</script>

<template>
  <UiButton
    :disabled="isDisabled"
    :title="isDisabled ? 'Save the manifest before deploying' : undefined"
    @click="isOpen = true"
  >
    <UiIcon :meaning="UiIconMeaning.Deploy" />
    Deploy
  </UiButton>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Deploy blueprint" :size="UiDialogSize.Medium">
    <template #default="{ formId }">
      <UiForm v-if="deployments.length === 0" :id="formId" flex flex-col gap-3 @submit="deploy()">
        <p v-if="blueprint.parameters.length === 0" text-muted>
          This blueprint has no parameters. Deploy creates every entry as a new, fully wired resource.
        </p>
        <div v-for="{ description, key, title } of blueprint.parameters" :key flex flex-col gap-1>
          <UiTextField
            :label="title || key"
            :model-value="parameterValues[key] ?? ''"
            @update:model-value="parameterValues[key] = $event"
          />
          <p v-if="description" text-muted>{{ description }}</p>
        </div>
        <!-- Each entry is a row leading with its type's mark, the name it will be created with after it -->
        <div v-if="deployReviews.length > 0" flex flex-col gap-1>
          <p>Creates {{ deployReviews.length }} {{ pluralize("resource", deployReviews.length) }}:</p>
          <ul flex flex-col>
            <li v-for="{ description, icon, key, title } of deployReviews" :key>
              <UiItemContent :description :icon :title />
            </li>
          </ul>
        </div>
      </UiForm>
      <div v-else flex flex-col gap-3>
        <p>Created {{ deployments.length }} {{ pluralize("resource", deployments.length) }}:</p>
        <!-- Each created resource is a row leading with its type's mark, the manifest alias it came from after its name -->
        <ul flex flex-col>
          <li v-for="{ key, resource: deployed } of deployments" :key="deployed.id">
            <NuxtLink :to="RoutePath.Resource(deployed.id)" ui-item>
              <UiItemContent
                :description="key"
                :icon="ResourceDefinitionMap[deployed.type].icon"
                :title="deployed.name"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </template>
    <template v-if="deployments.length === 0" #footer="{ formId }">
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="isDeployBlocked"
        :form="formId"
        :is-pending="isDeployPending"
        type="submit"
        :variant="UiButtonVariant.Accent"
      >
        Deploy
      </UiButton>
    </template>
    <template v-else #footer>
      <UiButton :variant="UiButtonVariant.Accent" @click="isOpen = false">Done</UiButton>
    </template>
  </UiDialog>
</template>
