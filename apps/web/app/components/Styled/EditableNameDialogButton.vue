<script setup lang="ts">
import type { VCard, VTooltip } from "vuetify/components";
import type { z } from "zod";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

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
      <UiTooltip v-if="isEditable" :label="tooltipProps.text ?? ''">
        <template #default="{ activatorProps }">
          <UiButton
            :="activatorProps"
            :variant="UiButtonVariant.Quiet"
            class="group"
            flex
            min-w-0
            @click="updateIsOpen(true)"
          >
            <slot>{{ name || placeholder }}</slot>
            <UiIcon :meaning="UiIconMeaning.Edit" op-0 group-focus-visible:op-100 group-hover:op-100 />
          </UiButton>
        </template>
      </UiTooltip>
      <!-- Only its editor may rename it, so for anyone else the name is only read -->
      <div v-else px-2 flex min-w-0 items-center>
        <slot>{{ name || placeholder }}</slot>
      </div>
    </template>
    <slot name="prepend-content" />
    <v-text-field v-model="editedName" autofocus density="compact" :placeholder :rules="nameRules" />
  </StyledFormDialog>
</template>
