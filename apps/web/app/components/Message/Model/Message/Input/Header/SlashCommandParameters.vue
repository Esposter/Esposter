<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
    { offset: 0, parameters: requiredParameters, subheader: "Required options" },
    { offset: requiredParameters.length, parameters: optionalParameters, subheader: "Optional" },
  ].filter(({ parameters }) => parameters.length > 0);
});
const focusedParameter = computed(() => activeParameters.value[focusedIndex.value]);
const errorMessage = computed(
  () => errors.value.find((parameterError) => parameterError.id === focusedParameter.value?.name)?.messages[0],
);
</script>

<template>
  <template v-if="pendingSlashCommand">
    <!-- The options the command has left to fill, which the trailing field walks by arrow while focus stays in it -->
    <div v-if="hiddenParameters.length > 0" py-1 flex flex-col ui-frame>
      <div
        v-for="{ offset, parameters, subheader } of hiddenParameterSections"
        :key="subheader"
        :aria-label="subheader"
        role="group"
        flex
        flex-col
      >
        <span aria-hidden="true" text-sm text-muted px-3 py-1>{{ subheader }}</span>
        <button
          v-for="({ name }, index) of parameters"
          :key="name"
          :data-highlighted="index + offset === selectedHiddenIndex || undefined"
          type="button"
          ui-item
          @click="createParameter(name)"
        >
          <UiItemContent :description="`Your ${name}`" :meaning="UiIconMeaning.Tag" :title="name" />
        </button>
      </div>
    </div>
    <MessageModelMessageInputHeader @close="clearPendingSlashCommand()">
      <template v-if="focusedParameter">
        <span text-heading-color>{{ focusedParameter.name }}</span>
        <span v-if="errorMessage" text-error truncate>{{ errorMessage }}</span>
        <span v-else text-muted truncate>Your {{ focusedParameter.name }}</span>
      </template>
      <template v-else>
        <span text-heading-color>/{{ pendingSlashCommand.title }}</span>
        <span text-muted truncate>{{ pendingSlashCommand.description }}</span>
      </template>
    </MessageModelMessageInputHeader>
  </template>
</template>
