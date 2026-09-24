<script setup lang="ts">
import type { BlueprintDeployment } from "#shared/models/resource/blueprint/BlueprintDeployment";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { useBlueprintStore } from "@/store/resource/blueprint";
import { RoutePath } from "@esposter/shared";

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
  <UiButton flex @click="isOpen = true">
    <span class="i-mdi:rocket-launch" aria-hidden="true" size-5 />
    Deploy
  </UiButton>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Deploy blueprint" w="[min(32rem,90vw)]">
    <UiForm v-if="deployments.length === 0" p-3 flex flex-col gap-3 @submit="deploy">
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
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="isDeployPending" type="submit" :variant="UiButtonVariant.Accent" flex>
          <UiSpinner v-if="isDeployPending" />
          Deploy
        </UiButton>
      </footer>
    </UiForm>
    <div v-else p-3 flex flex-col gap-3>
      <p>Created {{ deployments.length }} resources:</p>
      <ul flex flex-col gap-1>
        <li v-for="{ key, resource: deployed } of deployments" :key="deployed.id">
          <NuxtLink :to="RoutePath.Resource(deployed.id)" text-info hover:underline>{{ deployed.name }}</NuxtLink>
          <span text-muted> — {{ key }}</span>
        </li>
      </ul>
      <footer flex justify-end>
        <UiButton :variant="UiButtonVariant.Accent" @click="isOpen = false">Done</UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
