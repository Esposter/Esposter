<script setup lang="ts">
import type { TodoListStep } from "#shared/models/resource/todoList/TodoListStep";

import { ITEM_NAME_MAX_LENGTH, TODO_LIST_ITEM_STEPS_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiRules } from "@/services/ui/UiRules";

// Absent until the first step, and absent again once the last is removed, as the item's schema wants it
const modelValue = defineModel<TodoListStep[] | undefined>({ required: true });
const name = ref("");
const nameRules = [UiRules.maxLength(ITEM_NAME_MAX_LENGTH)];
const stepNameRules = [UiRules.required(), UiRules.maxLength(ITEM_NAME_MAX_LENGTH)];
// The item's schema rejects a longer checklist, so the field stops adding at the limit rather than the save failing
const isAtMaxSteps = computed(() => (modelValue.value?.length ?? 0) >= TODO_LIST_ITEM_STEPS_MAX_LENGTH);
// A browser global the template cannot reach
const addStep = () => {
  if (isAtMaxSteps.value || !name.value) return;
  modelValue.value = [...(modelValue.value ?? []), { id: crypto.randomUUID(), name: name.value }];
  name.value = "";
};
</script>

<!-- A todo's checklist, saved with the rest of the dialog: each step's box ticks only that step, its name edits where
     It stands, and the field at the foot adds on Enter, staying focused for the next, or on the button beside it -->
<template>
  <div flex flex-col gap-2>
    <ul v-if="modelValue" list-none flex flex-col gap-1>
      <li v-for="step of modelValue" :key="step.id" flex gap-2 items-center>
        <UiCheckbox
          :label="step.name"
          :model-value="Boolean(step.completedAt)"
          @update:model-value="step.completedAt = step.completedAt ? undefined : new Date()"
        />
        <div :class="{ 'text-muted': step.completedAt }" flex-1 min-w-0>
          <UiTextField v-model="step.name" is-label-hidden label="Step" :rules="stepNameRules" />
        </div>
        <UiIconButton
          label="Remove step"
          :meaning="UiIconMeaning.Remove"
          :variant="UiButtonVariant.Quiet"
          @click="
            () => {
              const remainingSteps = modelValue?.filter(({ id }) => id !== step.id) ?? [];
              modelValue = remainingSteps.length > 0 ? remainingSteps : undefined;
            }
          "
        />
      </li>
    </ul>
    <!-- Inside the dialog's own form, so Enter here adds the step and is kept from saving the dialog -->
    <div
      flex
      gap-2
      items-start
      @keydown.enter.prevent="
        (event: KeyboardEvent) => {
          if (!event.isComposing) addStep();
        }
      "
    >
      <UiTextField
        v-model="name"
        :hint="isAtMaxSteps ? `A todo holds at most ${TODO_LIST_ITEM_STEPS_MAX_LENGTH} steps` : undefined"
        is-label-hidden
        label="Add step"
        placeholder="Add step"
        :rules="nameRules"
        flex-1
        min-w-0
      />
      <UiIconButton
        :disabled="isAtMaxSteps || !name"
        label="Add step"
        :meaning="UiIconMeaning.Create"
        @click="addStep()"
      />
    </div>
  </div>
</template>
