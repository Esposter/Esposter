<script setup lang="ts">
import type { VCard, VTooltip } from "vuetify/components";
import type { z } from "zod";

import { mergeProps } from "vue";

interface Props {
  cardProps: VCard["$props"];
  isDirty?: boolean;
  isEditable?: boolean;
  maxLength: number;
  name: string;
  placeholder?: string;
  schema: z.ZodType<string>;
  tooltipProps: VTooltip["$props"];
}

defineSlots<{ default?: () => VNode; "prepend-content"?: () => VNode }>();
const modelValue = defineModel<boolean>({ default: false });
const {
  cardProps,
  isDirty = false,
  isEditable = true,
  maxLength,
  name,
  placeholder,
  schema,
  tooltipProps,
} = defineProps<Props>();
const emit = defineEmits<{ submit: [name: string] }>();
const rules = useVRules();
const { cloned: editedName } = useCloned(() => name);
const nameRules = computed(() => [rules.maxLength(maxLength), rules.isNotProfanity()]);
const confirmButtonAttrs = computed(() => ({
  disabled: schema.safeParse(editedName.value).data === name && !isDirty,
}));
</script>

<template>
  <StyledFormDialog
    v-model="modelValue"
    :card-props
    :confirm-button-attrs
    :confirm-button-props="{ text: 'Save' }"
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
                :class="isEditable ? undefined : 'pointer-events-none'"
                :ripple="false"
                slim
                font-bold
                rd-lg
                :="mergeProps(tooltipActivatorProps, hoverProps)"
                @click="updateIsOpen(true)"
              >
                <slot>
                  {{ name || placeholder }}
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
    <slot name="prepend-content" />
    <v-text-field v-model="editedName" autofocus density="compact" :placeholder :rules="nameRules" />
  </StyledFormDialog>
</template>

<style scoped>
:deep(.v-btn__overlay) {
  transition: none;
}
</style>
