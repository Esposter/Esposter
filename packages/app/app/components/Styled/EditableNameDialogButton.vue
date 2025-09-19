<script setup lang="ts">
import type { VCard, VTooltip } from "vuetify/components";

import { formRules } from "@/services/vuetify/formRules";
import { mergeProps } from "vue";

interface EditableNameDialogButtonProps {
  cardProps: VCard["$props"];
  isDisabled?: boolean;
  maxLength: number;
  name: string;
  tooltipProps: VTooltip["$props"];
}

defineSlots<{ default?: () => VNode }>();
const { cardProps, isDisabled, maxLength, name, tooltipProps } = defineProps<EditableNameDialogButtonProps>();
const emit = defineEmits<{ submit: [name: string] }>();
const editedName = ref(name);

watch(
  () => name,
  (newName) => {
    editedName.value = newName;
  },
);
</script>

<template>
  <StyledDialog
    :card-props
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      (_event, onComplete) => {
        try {
          if (editedName === name) return;
          emit('submit', editedName);
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip :="tooltipProps">
        <template #activator="{ props: tooltipActivatorProps }">
          <v-hover>
            <template #default="{ isHovering, props: hoverProps }">
              <v-btn
                rd-2
                :ripple="false"
                slim
                :disabled="isDisabled"
                :="mergeProps(tooltipActivatorProps, hoverProps)"
                @click="updateIsOpen(true)"
              >
                <slot />
                <template #append>
                  <v-icon v-show="!isDisabled && isHovering" icon="mdi-pencil" size="small" />
                </template>
              </v-btn>
            </template>
          </v-hover>
        </template>
      </v-tooltip>
    </template>
    <v-container px-6 fluid>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="editedName"
            density="compact"
            autofocus
            :rules="[
              formRules.required,
              formRules.requireAtMostNCharacters(maxLength),
              formRules.isNotEqual(name),
              formRules.isNotProfanity,
            ]"
          />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>

<style scoped lang="scss">
:deep(.v-btn__overlay) {
  transition: none;
}
</style>
