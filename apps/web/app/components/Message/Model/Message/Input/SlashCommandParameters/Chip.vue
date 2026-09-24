<script setup lang="ts">
import { slashCommandParameterValueSchema } from "@/models/message/slashCommands/SlashCommandParameter";
import { REQUIRED_ERROR_MESSAGE } from "@/services/message/slashCommands/constants";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { checkIsCaretAtEnd } from "@/util/dom/checkIsCaretAtEnd";
import { checkIsCaretAtStart } from "@/util/dom/checkIsCaretAtStart";

interface Props {
  autofocus?: boolean;
  isFocused?: boolean;
  isRequired: boolean;
  name: string;
}

const modelValue = defineModel<string>({ default: "" });
const { isFocused, isRequired, name } = defineProps<Props>();
const emit = defineEmits<{
  blur: [];
  delete: [];
  focus: [];
  "navigate:next": [];
  "navigate:previous": [];
  submit: [];
}>();
const slashCommandStore = useSlashCommandStore();
const { errors } = storeToRefs(slashCommandStore);
const { setErrors } = slashCommandStore;
const input = useTemplateRef("input");
const isError = computed(() => {
  const parameterError = errors.value.find(({ id }) => id === name);
  return Boolean(parameterError && parameterError.messages.length > 0);
});

useFocusWhenActive(input, () => isFocused);
</script>

<template>
  <!-- A parameter being filled: its name, then its value typed in place, set into the row as a field is. An invalid one
    Is tinted as a failing field is, and a focused one as a focused field is -->
  <div class="chip" :data-invalid="isError || undefined" inline-flex items-center of-hidden ui-field>
    <span :class="{ 'text-error': isError }" text-sm py-1 pl-2 pr-1>{{ name }}</span>
    <!-- eslint-disable vuejs-accessibility/no-autofocus -- Focus follows the parameter the user just added, the
      same deliberate move a dialog makes on open; without it the chip renders unfocused mid-typing. -->
    <input
      ref="input"
      v-model="modelValue"
      :aria-label="name"
      text-inherit
      pr-2
      outline-none
      bg-transparent
      field-sizing-content
      :autofocus
      @focus="emit('focus')"
      @blur="emit('blur')"
      @update:model-value="
        setErrors(
          name,
          isRequired && !slashCommandParameterValueSchema.safeParse($event).success ? [REQUIRED_ERROR_MESSAGE] : [],
        )
      "
      @keydown.enter.prevent="emit('submit')"
      @keydown.delete="!modelValue && emit('delete')"
      @keydown.left.exact="
        (event) => {
          if (checkIsCaretAtStart(event.target as HTMLInputElement)) {
            event.preventDefault();
            emit('navigate:previous');
          }
        }
      "
      @keydown.right.exact="
        (event) => {
          if (checkIsCaretAtEnd(event.target as HTMLInputElement)) {
            event.preventDefault();
            emit('navigate:next');
          }
        }
      "
    />
    <!-- eslint-enable vuejs-accessibility/no-autofocus -->
  </div>
</template>

<style scoped>
.chip:focus-within {
  background-color: color-mix(in srgb, var(--ui-tint) 10%, var(--ui-panel));
}

.chip[data-invalid] {
  background-color: color-mix(in srgb, var(--ui-error) 12%, var(--ui-panel));
}
</style>
