<script setup lang="ts">
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

const slashCommandStore = useSlashCommandStore();
const { activeParameters, errors, focusedIndex, hiddenParameters, pendingSlashCommand, selectedHiddenIndex } =
  storeToRefs(slashCommandStore);
const { clearPendingSlashCommand, createParameter } = slashCommandStore;
// One list rendered as two labelled runs, so selectedHiddenIndex — which indexes hiddenParameters as a whole —
// Stays comparable against each run through its offset
const hiddenParameterSections = computed(() => {
  const requiredParameters = hiddenParameters.value.filter(({ isRequired }) => isRequired);
  const optionalParameters = hiddenParameters.value.filter(({ isRequired }) => !isRequired);
  return [
    { offset: 0, parameters: requiredParameters, subheader: "REQUIRED OPTIONS" },
    { offset: requiredParameters.length, parameters: optionalParameters, subheader: "OPTIONAL" },
  ].filter(({ parameters }) => parameters.length > 0);
});
const focusedParameter = computed(() => activeParameters.value[focusedIndex.value]);
const error = computed(
  () => errors.value.find((parameterError) => parameterError.id === focusedParameter.value?.name)?.messages[0],
);
</script>

<template>
  <template v-if="pendingSlashCommand">
    <StyledCard v-if="hiddenParameters.length > 0" pb-2>
      <v-list density="compact">
        <template v-for="{ offset, parameters, subheader } of hiddenParameterSections" :key="subheader">
          <v-list-subheader>{{ subheader }}</v-list-subheader>
          <v-list-item
            v-for="({ name }, index) of parameters"
            :key="name"
            :active="index + offset === selectedHiddenIndex"
            @click="createParameter(name)"
          >
            <template #title>
              <span font-bold>{{ name }}</span>
            </template>
            <template #append>
              <span ml-4 op-medium-emphasis text-body-medium>Your {{ name }}</span>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </StyledCard>
    <MessageModelMessageInputHeader @close="clearPendingSlashCommand()">
      <template v-if="focusedParameter">
        <span font-bold>{{ focusedParameter.name }}</span>
        <span v-if="error" text-error>{{ error }}</span>
        <span v-else op-medium-emphasis>Your {{ focusedParameter.name }}</span>
      </template>
      <template v-else>
        <span font-bold>/{{ pendingSlashCommand.title }}</span>
        <span op-medium-emphasis>{{ pendingSlashCommand.description }}</span>
      </template>
    </MessageModelMessageInputHeader>
  </template>
</template>
