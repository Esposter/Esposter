<script setup lang="ts">
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

const slashCommandStore = useSlashCommandStore();
const { activeParameterNames, errors, focusedIndex, pendingSlashCommand, selectedHiddenIndex } =
  storeToRefs(slashCommandStore);
const { clearPendingSlashCommand, createParameter } = slashCommandStore;
const activeParameters = computed(
  () => pendingSlashCommand.value?.parameters.filter(({ name }) => activeParameterNames.value.includes(name)) ?? [],
);
const hiddenParameters = computed(
  () => pendingSlashCommand.value?.parameters.filter(({ name }) => !activeParameterNames.value.includes(name)) ?? [],
);
const requiredHiddenParameters = computed(() => hiddenParameters.value.filter(({ isRequired }) => isRequired));
const optionalHiddenParameters = computed(() => hiddenParameters.value.filter(({ isRequired }) => !isRequired));
const focusedParameter = computed(() => activeParameters.value[focusedIndex.value]);
const firstError = computed(() => errors.value[0]?.messages[0]);
</script>

<template>
  <template v-if="pendingSlashCommand">
    <StyledCard v-if="hiddenParameters.length > 0" pb-2>
      <v-list density="compact">
        <v-list-subheader v-if="requiredHiddenParameters.length > 0">REQUIRED OPTIONS</v-list-subheader>
        <v-list-item
          v-for="({ name }, i) of requiredHiddenParameters"
          :key="name"
          :active="i === selectedHiddenIndex"
          @click="createParameter(name)"
        >
          <template #title>
            <span font-bold>{{ name }}</span>
          </template>
          <template #append>
            <span opacity-50 text-sm ml-4>Your {{ name }}</span>
          </template>
        </v-list-item>
        <template v-if="optionalHiddenParameters.length > 0">
          <v-list-subheader>OPTIONAL</v-list-subheader>
          <v-list-item
            v-for="({ name }, i) of optionalHiddenParameters"
            :key="name"
            :active="i + requiredHiddenParameters.length === selectedHiddenIndex"
            @click="createParameter(name)"
          >
            <template #title>
              <span font-bold>{{ name }}</span>
            </template>
            <template #append>
              <span opacity-50 text-sm ml-4>Your {{ name }}</span>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </StyledCard>
    <MessageModelMessageInputHeader @close="clearPendingSlashCommand()">
      <template v-if="focusedParameter">
        <span font-bold>{{ focusedParameter.name }}</span>
        <span v-if="firstError" class="text-error">{{ firstError }}</span>
        <span v-else opacity-60>Your {{ focusedParameter.name }}</span>
      </template>
      <template v-else>
        <span font-bold>/{{ pendingSlashCommand.title }}</span>
        <span opacity-60>{{ pendingSlashCommand.description }}</span>
      </template>
    </MessageModelMessageInputHeader>
  </template>
</template>
