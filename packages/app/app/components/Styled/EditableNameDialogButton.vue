<script setup lang="ts">
import type { VBtn, VCard, VTooltip } from "vuetify/components";

import { formRules } from "@/services/vuetify/formRules";
import { mergeProps } from "vue";

interface EditableNameDialogButtonProps {
  buttonProps?: VBtn["$props"];
  cardProps: VCard["$props"];
  isEditable?: boolean;
  maxLength: number;
  name: string;
  placeholder?: string;
  tooltipProps: VTooltip["$props"];
}

defineSlots<{ default?: () => VNode }>();
const { buttonProps, cardProps, isEditable, maxLength, name, placeholder, tooltipProps } =
  defineProps<EditableNameDialogButtonProps>();
const emit = defineEmits<{ submit: [name: string] }>();
const editedName = ref(name);
const displayName = computed(() => name || placeholder);

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
    :confirm-button-props="{ text: 'Save', disabled: editedName === name }"
    @submit="
      (_event, onComplete) => {
        emit('submit', editedName);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip :="tooltipProps">
        <template #activator="{ props: tooltipActivatorProps }">
          <v-hover>
            <template #default="{ isHovering, props: hoverProps }">
              <v-btn
                :style="{ pointerEvents: isEditable ? undefined : 'none' }"
                font-bold
                rounded="lg"
                :ripple="false"
                slim
                :="mergeProps(tooltipActivatorProps, hoverProps, buttonProps ?? {})"
                @click="updateIsOpen(true)"
              >
                <slot>
                  {{ displayName }}
                </slot>
                <template #append>
                  <v-icon v-if="isEditable" :op="isHovering ? undefined : '0!'" icon="mdi-pencil" size="small" />
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
            :model-value="editedName"
            density="compact"
            :placeholder
            autofocus
            :rules="[formRules.requireAtMostNCharacters(maxLength), formRules.isNotProfanity]"
            @update:model-value="editedName = $event.trim()"
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
