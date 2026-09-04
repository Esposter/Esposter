<script setup lang="ts">
import type { BlueprintDeployment } from "#shared/models/resource/blueprint/BlueprintDeployment";

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
const buttonProps = computed(() => ({
  disabled: isDeployPending.value,
  loading: isDeployPending.value,
  text: "Deploy",
}));
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
  <StyledButton :button-props="{ prependIcon: 'mdi-rocket-launch', text: 'Deploy' }" @click="isOpen = true" />
  <v-dialog v-model="isOpen" max-width="32rem">
    <v-card>
      <v-card-title>Deploy blueprint</v-card-title>
      <v-card-text v-if="deployments.length === 0">
        <p v-if="blueprint.parameters.length === 0" op-medium-emphasis>
          This blueprint has no parameters. Deploy creates every entry as a new, fully wired resource.
        </p>
        <v-text-field
          v-for="{ description, key, title } of blueprint.parameters"
          :key
          v-model="parameterValues[key]"
          :hint="description"
          :label="title || key"
          persistent-hint
        />
      </v-card-text>
      <v-card-text v-else>
        <p mb-2>Created {{ deployments.length }} resources:</p>
        <v-list>
          <v-list-item
            v-for="{ key, resource: deployed } of deployments"
            :key="deployed.id"
            :subtitle="key"
            :title="deployed.name"
            :to="RoutePath.Resource(deployed.id)"
          />
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <template v-if="deployments.length === 0">
          <StyledButton :button-props="{ text: 'Cancel', variant: 'text' }" @click="isOpen = false" />
          <StyledButton :button-props @click="deploy" />
        </template>
        <StyledButton v-else :button-props="{ text: 'Done' }" @click="isOpen = false" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
