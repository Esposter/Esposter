<script setup lang="ts">
import type { TodoListStep } from "#shared/models/resource/todoList/TodoListStep";

import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiRules } from "#src/services/ui/UiRules";

interface Props {
  step: TodoListStep;
}

defineProps<Props>();
const emit = defineEmits<{ remove: []; rename: [name: string]; toggle: [] }>();
const stepNameRules = [UiRules.required(), UiRules.maxLength(ITEM_NAME_MAX_LENGTH)];
</script>

<template>
  <li flex gap-2 items-center>
    <UiCheckbox :label="step.name" :model-value="Boolean(step.completedAt)" @update:model-value="emit('toggle')" />
    <div :class="{ 'text-muted': step.completedAt }" flex-1 min-w-0>
      <!-- The remove sits in the field's trailing slot, so it lines up with the input box while an error line grows beneath -->
      <UiTextField
        :model-value="step.name"
        is-label-hidden
        label="Step"
        :rules="stepNameRules"
        @update:model-value="(name) => emit('rename', name)"
      >
        <template #trailing>
          <UiIconButton
            label="Remove step"
            :meaning="UiIconMeaning.Remove"
            :variant="UiButtonVariant.Quiet"
            @click="emit('remove')"
          />
        </template>
      </UiTextField>
    </div>
  </li>
</template>
